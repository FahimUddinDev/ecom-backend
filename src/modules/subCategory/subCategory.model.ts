// User model
import { Prisma, SubCategories } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findSubCategory = async (
  query: Prisma.SubCategoriesFindUniqueArgs
): Promise<SubCategories | null> => {
  return prisma.subCategories.findUnique(query);
};

export const createSubCategory = async (
  data: Prisma.SubCategoriesCreateInput
): Promise<SubCategories> => {
  return prisma.subCategories.create({
    data,
  });
};

export const findSubCategories = async (query: {}): Promise<
  SubCategories[] | null
> => {
  return prisma.subCategories.findMany(query);
};

export const updateSubCategory = async (
  id: number,
  data: Partial<SubCategories>
) => {
  return prisma.subCategories.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      thumbnail: true,
    },
  });
};

export const deleteSubCategory = async (id: number): Promise<SubCategories> => {
  return prisma.subCategories.delete({ where: { id } });
};
