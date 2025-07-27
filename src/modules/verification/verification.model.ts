import { Prisma, User, Verification } from "@prisma/client";
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
