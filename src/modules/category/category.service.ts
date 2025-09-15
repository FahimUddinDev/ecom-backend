import { Prisma } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/customError";
import * as categoryModel from "./category.model";

export const createCategory = async ({
  name,
  thumbnail,
}: Prisma.CategoriesCreateInput) => {
  const existing = await categoryModel.findCategory({ where: { name } });
  if (existing) throw new HttpError("This category already exist!", 409);
  const category = await categoryModel.createCategory({
    name: name.toLowerCase(),
    thumbnail: thumbnail ? `/public/${thumbnail}` : null,
  });
  return category;
};

export const getCategories = async () => {
  const query = {
    select: {
      id: true,
      name: true,
      thumbnail: true,
      subCategories: {
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
      },
    },
  };

  const categories = await categoryModel.findCategories(query);
  return categories;
};

export const getCategory = async (query: { id: number } | { name: string }) => {
  const category = await categoryModel.findCategory({
    where: query,
    select: {
      id: true,
      name: true,
      thumbnail: true,
      subCategories: {
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
      },
    },
  });
  if (!category) throw new HttpError("Category Not found!", 404);
  return category;
};

export const updateCategory = async (
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
    const existingCategory = await categoryModel.findCategory({
      where: { id },
    });
    const oldThumbnailPath = existingCategory?.thumbnail;

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
  return categoryModel.updateCategory(id, data);
};

export const deleteCategory = async ({
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
  const category = await categoryModel.findCategory({
    where: { id },
    select: { id: true },
  });
  if (!category) {
    throw new HttpError("Category not found!", 404);
  }

  // Check if category has any subcategories
  const subCategoriesCount = await prisma.subCategories.count({
    where: { categoryId: id },
  });

  if (subCategoriesCount > 0) {
    throw new HttpError(
      `Cannot delete category. It has ${subCategoriesCount} subcategories. Please delete all subcategories first.`,
      400
    );
  }

  // Check if category has any products
  const productsCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productsCount > 0) {
    throw new HttpError(
      `Cannot delete category. It has ${productsCount} products. Please move or delete all products first.`,
      400
    );
  }

  // Delete the category thumbnail file if it exists
  if (category.thumbnail) {
    const filename = category.thumbnail.replace("/public/", "");
    const filePath = path.join(__dirname, "../../../../uploads", filename);
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Failed to delete category thumbnail:", err);
        });
      }
    });
  }

  return categoryModel.deleteCategory(id);
};
