// User model
import { Categories, Orders, Prisma } from "@prisma/client";
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

export const findCategories = async (query: {}): Promise<
  Categories[] | null
> => {
  return prisma.categories.findMany(query);
};

export const updateCategory = async (id: number, data: Partial<Categories>) => {
  return prisma.categories.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      thumbnail: true,
    },
  });
};

export const deleteCategory = async (id: number): Promise<Categories> => {
  return prisma.categories.delete({ where: { id } });
};

export const findOrders = async (query: {}): Promise<Orders[] | null> => {
  return prisma.orders.findMany(query);
};
