// User model
import { Categories, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findCategory = async (
  query: Prisma.CategoriesFindUniqueArgs
): Promise<Categories | null> => {
  return prisma.categories.findUnique(query);
};

export const createCategory = async (
  data: Prisma.CategoriesCreateInput
): Promise<Categories> => {
  return prisma.categories.create({ data });
};
