// User model
import { ChildCategories, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findChildCategory = async (
  query: Prisma.ChildCategoriesFindUniqueArgs
): Promise<ChildCategories | null> => {
  return prisma.childCategories.findUnique(query);
};

export const createChildCategory = async (
  data: Prisma.ChildCategoriesCreateInput
): Promise<ChildCategories> => {
  return prisma.childCategories.create({
    data,
  });
};

export const findChildCategories = async (query: {}): Promise<
  ChildCategories[] | null
> => {
  return prisma.childCategories.findMany(query);
};

export const updateChildCategory = async (
  id: number,
  data: Partial<ChildCategories>
) => {
  return prisma.childCategories.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      thumbnail: true,
    },
  });
};

export const deleteChildCategory = async (
  id: number
): Promise<ChildCategories> => {
  return prisma.childCategories.delete({ where: { id } });
};
