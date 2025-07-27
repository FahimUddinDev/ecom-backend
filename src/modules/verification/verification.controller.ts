import { NextFunction, Request, Response } from "express";
import * as verificationServices from "./verification.service";

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

// const createKyc = async (req: Request, res: Response, next: NextFunction) => {
//   const { userId, kycData } = req.body;
//   const kyc = await createKycService({
//     userId,
//     ...kycData,
//   });
//   res.json("KYC created successfully");
// };
// export const getKyc = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { userId } = req.body;
//   const kyc = await getKycService(userId);
//   res.json(kyc);
// };
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
