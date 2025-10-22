// products model
import { Prisma, Product } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const createProduct = async (
  data: Prisma.ProductCreateInput
): Promise<Product> => {
  return prisma.product.create({ data });
};

export const findProducts = async (): Promise<Product[] | null> => {
  return prisma.product.findMany();
};
