import { Prisma, User } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findUser = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
      role: true,
      avatar: true,
      password: true,
      status: true,
      verified: true,
      kyc: {
        select: {
          status: true,
        },
      },
    },
  });
};

export const createUser = async (
  data: Prisma.UserCreateInput
): Promise<User> => {
  return prisma.user.create({ data });
};

export const findEmailTemplate = async (
  query: Prisma.EmailTemplateFindUniqueArgs
) => {
  return prisma.emailTemplate.findUnique({
    where: query.where,
  });
};

export const resetPassword = async (id: number, password: string) => {
  return prisma.user.update({
    where: { id },
    data: { password },
  });
};
