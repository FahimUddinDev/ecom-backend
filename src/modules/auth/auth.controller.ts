import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../utils/customError";
import { googleLoginUser, loginUser, verifyGoogleToken } from "./auth.service";

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, isRemember } = req.body;
  const loginInfo = await loginUser({
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
  const payload = await verifyGoogleToken(token);
  if (!payload) {
    return next(new HttpError("Invalid Google token", 401));
  }
  if (!payload.email) {
    throw new Error("Google payload is missing email");
  }
  const user = await googleLoginUser({
    email: payload.email,
    given_name: payload.given_name || "",
    family_name: payload?.family_name || "",
    picture: payload?.picture || "",
  });
  res.json(user);
};
