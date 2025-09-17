import fs from "fs";
import path from "path";
import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/customError";
import * as childCategoryModel from "./childCategory.model";

export const createChildCategory = async ({
  subCategoryId,
  name,
  thumbnail,
}: {
  subCategoryId: number;
  name: string;
  thumbnail: string | null;
}) => {
  const existing = await childCategoryModel.findChildCategory({
    where: {
      name_subCategoryId: {
        name,
        subCategoryId: +subCategoryId,
      },
    },
  });
  if (existing) throw new HttpError("This category already exist!", 409);
  const childCategory = await childCategoryModel.createChildCategory({
    subCategory: { connect: { id: +subCategoryId } },
    name: name.toLowerCase(),
    thumbnail: thumbnail ? `/public/${thumbnail}` : null,
  });
  return childCategory;
};

export const getChildCategories = async (userQuery: {
  subCategoryId?: string;
}) => {
  const subCategoryId = userQuery.subCategoryId;
  let query;
  query = {
    select: {
      id: true,
      name: true,
      thumbnail: true,
    },
  };
  if (typeof subCategoryId === "string") {
    query = { ...query, where: { subCategoryId: parseInt(subCategoryId) } };
  }
  const childCategories = await childCategoryModel.findChildCategories(query);
  return childCategories;
};

export const getChildCategory = async (query: { id: number }) => {
  const childCategory = await childCategoryModel.findChildCategory({
    where: query,
    select: {
      id: true,
      name: true,
      thumbnail: true,
    },
  });
  if (!childCategory) throw new HttpError("Child Category Not found!", 404);
  return childCategory;
};

export const updateChildCategory = async (
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
    const existingChildCategory = await childCategoryModel.findChildCategory({
      where: { id },
    });
    const oldThumbnailPath = existingChildCategory?.thumbnail;

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
  return childCategoryModel.updateChildCategory(id, data);
};

export const deleteChildCategory = async ({
  id,
  role,
}: {
  id: number;
  role: string;
}) => {
  if (role !== "admin") {
    throw new HttpError("Permission denied!", 403);
  }
  const childCategory = await childCategoryModel.findChildCategory({
    where: { id },
    select: { id: true, thumbnail: true },
  });

  if (!childCategory) {
    throw new HttpError(`Don't have any Child category with this id.`, 404);
  }

  // Check if category has any products
  const productsCount = await prisma.product.count({
    where: { childCategoryId: id },
  });

  if (productsCount > 0) {
    throw new HttpError(
      `Cannot delete category. It has ${productsCount} products. Please move or delete all products first.`,
      400
    );
  }

  // Delete the category thumbnail file if it exists
  if (childCategory?.thumbnail) {
    const filename = childCategory.thumbnail.replace("/public/", "");
    const filePath = path.join(__dirname, "../../../../uploads", filename);
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Failed to delete category thumbnail:", err);
        });
      }
    });
  }

  return childCategoryModel.deleteChildCategory(id);
};
