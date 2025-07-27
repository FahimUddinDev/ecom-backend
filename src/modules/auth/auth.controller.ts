import { NextFunction, Request, RequestHandler, Response } from "express";
import { HttpError } from "../../utils/customError";
import * as authService from "./auth.service";

export interface AuthenticatedRequest extends Request {
  user: {
    data: {
      id: number; // or string, depending on your logic
    };
  };
}

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, isRemember } = req.body;
  const loginInfo = await authService.loginUser({
    email,
    password,
    isRemember,
  });
  res.json(loginInfo);
};

export const googleLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.body;
  const payload = await authService.verifyGoogleToken(token);
  if (!payload) {
    return next(new HttpError("Invalid Google token", 401));
  }
  if (!payload.email) {
    throw new Error("Google payload is missing email");
  }
  const user = await authService.googleLoginUser({
    email: payload.email,
    given_name: payload.given_name || "",
    family_name: payload?.family_name || "",
    picture: payload?.picture || "",
  });
  res.json(user);
};

export const resetPassword: RequestHandler = async (req, res, next) => {
  const user = (req as AuthenticatedRequest).user;
  const id = user?.data?.id;
  const { newPassword } = req.body;

  if (!id || !newPassword) {
    return res
      .status(400)
      .json({ message: "User ID and new password are required" });
  }

  try {
    await authService.resetPassword(Number(id), newPassword);
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};
