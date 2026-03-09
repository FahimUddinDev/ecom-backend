import { AdditionalInfo, Prisma, Product } from "@prisma/client";
import { prisma } from "../../../config/prisma";

export const findProduct = async (
  query: Prisma.ProductFindUniqueArgs,
): Promise<Product | null> => {
  return prisma.product.findUnique(query);
};

export const createAdditionalInfo = async (
  data: Prisma.AdditionalInfoCreateInput,
): Promise<AdditionalInfo> => {
  return prisma.additionalInfo.create({ data });
};

export const createManyAdditionalInfos = (
  data: Prisma.AdditionalInfoCreateManyInput[],
) => {
  return prisma.additionalInfo.createMany({ data });
};

export const updateAdditionalInfo = async (
  id: number,
  data: Prisma.AdditionalInfoUpdateInput,
): Promise<AdditionalInfo> => {
  return prisma.additionalInfo.update({
    where: { id: +id },
    data,
  });
};

export const findAdditionalInfo = async (
  query: Prisma.AdditionalInfoFindUniqueArgs,
): Promise<AdditionalInfo | null> => {
  return prisma.additionalInfo.findUnique(query);
};

export const deleteAdditionalInfo = async (
  id: number,
): Promise<AdditionalInfo> => {
  return prisma.additionalInfo.delete({ where: { id } });
};

export const findAdditionalInfos = async (
  query: Prisma.AdditionalInfoFindManyArgs,
): Promise<AdditionalInfo[]> => {
  return prisma.additionalInfo.findMany(query);
};

export const countAdditionalInfos = async (
  query: Prisma.AdditionalInfoCountArgs,
): Promise<number> => {
  return prisma.additionalInfo.count(query);
};
