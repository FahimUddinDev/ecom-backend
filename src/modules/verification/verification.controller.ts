import { NextFunction, Request, Response } from "express";
import * as verificationServices from "./verification.service";

export interface AuthenticatedRequest extends Request {
  user: {
    data: {
      id: number;
      role: string;
    };
  };
}

export const createVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;
  const verification = await verificationServices.createVerification({
    userId,
  });
  res.json("Verification sent successfully");
};

export const getVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, code } = req.body;
  if (!code || code.length !== 6) {
    return res.status(400).json({ message: "Invalid verification code" });
  }
  const updatedVerification = await verificationServices.getVerify({
    userId,
    code,
  });
  res.json("Verification successful");
};

export const forgotPasswordVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, code } = req.body;

  if (!code || code.length !== 6) {
    return res.status(400).json({ message: "Invalid verification code" });
  }
  const updatedVerification = await verificationServices.forgotPasswordVerify({
    userId,
    code,
  });
  res.json(updatedVerification);
};

export const createKyc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as AuthenticatedRequest).user;
  const id = user?.data?.id;
  const { document, title } = req.body;
  const kyc = await verificationServices.createKyc({
    id,
    document,
    title,
  });
  res.json(kyc);
};

export const getKycs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as AuthenticatedRequest).user;
  if (user.data.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const query = await req.query;
  const kycs = await verificationServices.getKycs(query);
  res.json(kycs);
};

export const getKyc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as AuthenticatedRequest).user;
  const { id } = req.params;
  const userId = Number(id);
  if (user.data.role !== "admin" && user.data.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const kyc = await verificationServices.getKyc(userId);
  res.json(kyc);
};
// export const updateKyc = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { userId, kycData } = req.body;
//   const updatedKyc = await updateKycService({
//     userId,
//     ...kycData,
//   });
//   res.json("KYC updated successfully");
// };
// export const deleteKyc = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { userId } = req.body;
//   await deleteKycService(userId);
//   res.json("KYC deleted successfully");
// };
