import { Prisma, Product, Variant } from "@prisma/client";
import { prisma } from "../../../config/prisma";

export const findProduct = async (
  query: Prisma.ProductFindUniqueArgs,
): Promise<Product | null> => {
  return prisma.product.findUnique(query);
};

export const createVariant = async (
  data: Prisma.VariantCreateInput,
): Promise<Variant> => {
  return prisma.variant.create({ data });
};
