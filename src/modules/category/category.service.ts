import { Prisma } from "@prisma/client";
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
