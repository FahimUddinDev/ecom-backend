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

export const createKyc = async ({
  id,
  document,
  title,
}: {
  id: number;
  document: string;
  title: string;
}) => {
  const kycExists = await verificationModel.getKyc(id);
  if (kycExists.length > 0) {
    if (
      kycExists.find(
        (k: { status: string }) =>
          k.status === "pending" || k.status === "approved"
      )
    ) {
      throw new HttpError("KYC is already in process or approved", 400);
    }
    throw new HttpError("KYC already exists", 400);
  }

  return verificationModel.createKyc({
    document,
    title: title.toLowerCase(),
    user: {
      connect: { id },
    },
  });
};

export const getKycs = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  createdAt?: string | { from?: string; to?: string };
  orderBy?: "asc" | "desc";
}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.search) {
    const keyword = query.search.toLowerCase();
    where.OR = [{ title: { contains: keyword } }];
  }

  if (typeof query.status) where.status = query.status;

  if (query.createdAt) {
    if (typeof query.createdAt === "string") {
      where.createdAt = { equals: new Date(query.createdAt) };
    } else if (typeof query.createdAt === "object") {
      where.createdAt = {};
      if (query.createdAt.from) {
        where.createdAt.gte = new Date(query.createdAt.from);
      }
      if (query.createdAt.to) {
        where.createdAt.lte = new Date(query.createdAt.to);
      }
    }
  }
  const orderBy = { createdAt: query.orderBy === "asc" ? "asc" : "desc" };
  const total = await verificationModel.countKycs({ where });

  const kycs = await verificationModel.getKycs({
    where,
    skip,
    take: limit,
    orderBy,
    select: {
      id: true,
      title: true,
      createdAt: true,
      status: true,
    },
  });
  return { total, limit, page, kycs };
};

export const getKyc = async (userId: number) => {
  return verificationModel.getKyc(userId);
};
