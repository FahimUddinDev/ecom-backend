import jwt from "jsonwebtoken";
import { HttpError } from "../../utils/customError";
import * as verificationModel from "./verification.model";

// Fix 1: Avoid recursive call and properly create verification
export const createVerification = async ({ userId }: { userId: number }) => {
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

  // Assuming you have a create function in your model
  return verificationModel.createVerification({
    token,
    expiresAt,
    user: {
      connect: { id: userId },
    },
  });
};

export const getVerify = async ({
  userId,
  code,
}: {
  userId: number;
  code: string;
}) => {
  const verificationList = await verificationModel.getVerify(userId);

  const verification = verificationList[0];
  if (!verification || verification.token !== code) {
    throw new HttpError("Invalid verification code", 400);
  }

  if (new Date() > new Date(verification.expiresAt)) {
    throw new HttpError("Verification code expired", 400);
  }

  const updated = await verificationModel.updateUser(userId, {
    verified: true,
  });

  if (!updated) {
    throw new HttpError("Verification failed", 500);
  }

  await verificationModel.deleteVerification(verification.token);
  return updated;
};

export const forgotPasswordVerify = async ({
  userId,
  code,
}: {
  userId: number;
  code: string;
}) => {
  const verificationList = await verificationModel.getVerify(userId);

  const verification = verificationList[0];
  if (!verification || verification.token !== code) {
    throw new HttpError("Invalid verification code", 400);
  }

  if (new Date() > new Date(verification.expiresAt)) {
    throw new HttpError("Verification code expired", 400);
  }

  const token = await jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      data: {
        id: userId,
      },
    },
    process.env.JWT_SECRET || "eyJmb28iOiJiYXIifQ"
  );
  await verificationModel.deleteVerification(verification.token);
  return { token };
};
