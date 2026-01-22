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

export const updateVariant = async (
  id: number,
  data: Prisma.VariantUpdateInput,
): Promise<Variant> => {
  return prisma.variant.update({
    where: { id: +id },
    data,
  });
};

export const findVariant = async (
  query: Prisma.VariantFindUniqueArgs,
): Promise<Variant | null> => {
  return prisma.variant.findUnique(query);
};

export const deleteVariant = async (id: number): Promise<Variant> => {
  return prisma.variant.delete({ where: { id } });
};

export const countOrders = async (
  query: Prisma.OrdersCountArgs,
): Promise<number> => {
  return prisma.orders.count(query);
};

export const findVariants = async (
  query: Prisma.VariantFindManyArgs,
): Promise<Variant[]> => {
  return prisma.variant.findMany(query);
};

export const countVariants = async (
  query: Prisma.VariantCountArgs,
): Promise<number> => {
  return prisma.variant.count(query);
};
