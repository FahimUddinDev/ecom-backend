import fs from "fs";
import path from "path";
import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/customError";
import * as subCategoryModel from "./subCategory.model";

export const createSubCategory = async ({
  categoryId,
  name,
  thumbnail,
}: {
  categoryId: number;
  name: string;
  thumbnail: string | null;
}) => {
  const existing = await subCategoryModel.findSubCategory({
    where: {
      name_categoryId: {
        name,
        categoryId: +categoryId,
      },
    },
  });
  if (existing) throw new HttpError("This category already exist!", 409);
  const subCategory = await subCategoryModel.createSubCategory({
    category: { connect: { id: +categoryId } },
    name: name.toLowerCase(),
    thumbnail: thumbnail ? `/public/${thumbnail}` : null,
  });
  return subCategory;
};

export const getSubCategories = async (userQuery: { categoryId?: string }) => {
  const categoryId = userQuery.categoryId;
  let query;
  query = {
    select: {
      id: true,
      name: true,
      thumbnail: true,
      childCategories: {
        select: {
          id: true,
          name: true,
          thumbnail: true,
        },
      },
    },
  };
  if (typeof categoryId === "string") {
    query = { ...query, where: { categoryId: parseInt(categoryId) } };
  }
  const subCategories = await subCategoryModel.findSubCategories(query);
  return subCategories;
};

export const getSubCategory = async (query: { id: number }) => {
  const subCategory = await subCategoryModel.findSubCategory({
    where: query,
    select: {
      id: true,
      name: true,
      thumbnail: true,
      childCategories: {
        select: {
          id: true,
          name: true,
          thumbnail: true,
        },
      },
    },
  });
  if (!subCategory) throw new HttpError("Sub Category Not found!", 404);
  return subCategory;
};

export const updateSubCategory = async (
  id: number,
  role: string,
  data: Partial<{
    name: string;
    thumbnail: string | null;
  }>
) => {
  if (role !== "admin") {
    throw new HttpError("Permission denied!", 403);
  }
  // 2. Delete old thumbnail if new thumbnail is provided
  if (data?.thumbnail) {
    const existingSubCategory = await subCategoryModel.findSubCategory({
      where: { id },
    });
    const oldThumbnailPath = existingSubCategory?.thumbnail;

    if (oldThumbnailPath) {
      const filename = oldThumbnailPath.replace("/public/", "");
      const filePath = path.join(__dirname, "../../../../uploads", filename);
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete old avatar:", err);
          });
        }
      });
    }
  }
  return subCategoryModel.updateSubCategory(id, data);
};

export const deleteSubCategory = async ({
  id,
  role,
}: {
  id: number;
  role: string;
}) => {
  if (role !== "admin") {
    throw new HttpError("Permission denied!", 403);
  }

  // Check if category exists
  const subCategory = await subCategoryModel.findSubCategory({
    where: { id },
    select: { id: true, thumbnail: true },
  });
  if (!subCategory) {
    throw new HttpError("Category not found!", 404);
  }

  // Check if category has any child categories
  const childCategoriesCount = await prisma.childCategories.count({
    where: { subCategoryId: id },
  });

  if (childCategoriesCount > 0) {
    throw new HttpError(
      `Cannot delete category. It has ${childCategoriesCount} subcategories. Please delete all subcategories first.`,
      400
    );
  }

  // Check if category has any products
  const productsCount = await prisma.product.count({
    where: { subCategoryId: id },
  });

  if (productsCount > 0) {
    throw new HttpError(
      `Cannot delete category. It has ${productsCount} products. Please move or delete all products first.`,
      400
    );
  }

  // Delete the category thumbnail file if it exists
  if (subCategory?.thumbnail) {
    const filename = subCategory.thumbnail.replace("/public/", "");
    const filePath = path.join(__dirname, "../../../../uploads", filename);
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Failed to delete category thumbnail:", err);
        });
      }
    });
  }

  return subCategoryModel.deleteSubCategory(id);
};
