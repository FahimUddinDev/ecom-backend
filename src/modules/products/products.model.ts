// products model
import { Prisma, Product } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const createProduct = async (
  data: Prisma.ProductCreateInput
): Promise<Product> => {
  return prisma.product.create({ data });
};

export const findProducts = async (
  query: Prisma.ProductFindManyArgs
): Promise<Product[]> => {
  return prisma.product.findMany(query);
};

export const countProducts = async (
  query: Prisma.ProductCountArgs
): Promise<number> => {
  return prisma.product.count(query);
};
export const findProduct = async (
  query: Prisma.ProductFindUniqueArgs
): Promise<Product | null> => {
  return prisma.product.findUnique(query);
};

export const updateProduct = async (
  id: number,
  data: Prisma.ProductUpdateInput
): Promise<Product> => {
  return prisma.product.update({
    where: { id },
    data,
  });
};
