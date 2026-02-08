import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findCategoryUnique = (args: Prisma.BlogCategoryFindUniqueArgs) =>
    prisma.blogCategory.findUnique(args);

export const findCategories = (args: Prisma.BlogCategoryFindManyArgs) =>
    prisma.blogCategory.findMany(args);

export const createCategory = (data: Prisma.BlogCategoryCreateInput) => {
    return prisma.blogCategory.create({ data })
}

export const updateCategory = (args: Prisma.BlogCategoryUpdateArgs) =>
    prisma.blogCategory.update(args);

export const deleteCategory = (args: Prisma.BlogCategoryDeleteArgs) =>
    prisma.blogCategory.delete(args);

export const countPostsInCategory = (categoryId: number) =>
    prisma.blogPost.count({ where: { categoryId } });