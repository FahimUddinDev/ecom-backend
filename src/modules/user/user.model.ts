// User model
import { Prisma, User } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findUser = async (
  query: Prisma.UserFindUniqueArgs
): Promise<User | null> => {
  return prisma.user.findUnique(query);
};

export const createUser = async (
  data: Prisma.UserCreateInput
): Promise<User> => {
  return prisma.user.create({ data });
};

export const updateUser = async (
  id: number,
  data: Partial<User>
): Promise<User> => {
  return prisma.user.update({ where: { id }, data });
};

export const deleteUser = async (id: number): Promise<User> => {
  return prisma.user.delete({ where: { id } });
};

export const findAllUsers = async (query: {}): Promise<User[]> => {
  return prisma.user.findMany(query);
};
export const countUsers = async (
  query: Prisma.UserCountArgs
): Promise<number> => {
  return prisma.user.count(query);
};
