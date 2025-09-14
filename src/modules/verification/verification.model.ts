import { Kyc, Prisma, User, Verification } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const createVerification = async (
  data: Prisma.VerificationCreateInput
): Promise<Verification> => {
  return prisma.verification.create({ data });
};
export const getVerify = async (userId: number) => {
  return prisma.verification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      userId: true,
      token: true,
      expiresAt: true,
    },
  });
};
export const updateUser = async (id: number, data: Partial<User>) => {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      verified: true,
    },
  });
};

export const deleteVerification = async (
  token: string
): Promise<Verification> => {
  return prisma.verification.delete({ where: { token } });
};

export const createKyc = async (data: Prisma.KycCreateInput): Promise<Kyc> => {
  return prisma.kyc.create({ data });
};

export const getKycs = async (query: {}) => {
  return prisma.kyc.findMany(query);
};

export const countKycs = async (
  query: Prisma.KycCountArgs
): Promise<number> => {
  return prisma.kyc.count(query);
};

export const getKyc = async (userId: number) => {
  return prisma.kyc.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 1,
  });
};
