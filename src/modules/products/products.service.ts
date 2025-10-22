import { Prisma } from "@prisma/client";
import * as productModel from "./products.model";

export const createProduct = async ({
  sellerId,
  name,
  ShortDescription,
  description,
  price,
  currency,
  sku,
  stockQuantity,
  categoryId,
  subCategoryId,
  childCategoryId,
  hasVariants,
  images,
  thumbnail,
  tags,
}: {
  sellerId: number;
  name: string;
  ShortDescription?: string | null;
  description?: string | null;
  price: Prisma.Decimal;
  currency: string;
  sku: string | null;
  stockQuantity: number;
  categoryId: number;
  subCategoryId: number;
  childCategoryId: number;
  hasVariants: string;
  images: string;
  thumbnail: string;
  tags: string;
}) => {
  const variant = hasVariants === "true";
  const product = await productModel.createProduct({
    seller: { connect: { id: +sellerId } },
    name,
    ShortDescription,
    description,
    price,
    currency,
    sku,
    stockQuantity: Number(stockQuantity),
    category: { connect: { id: +categoryId } },
    subCategory: { connect: { id: +subCategoryId } },
    childCategory: { connect: { id: +childCategoryId } },
    hasVariants: hasVariants === "true",
    images: JSON.stringify(images),
    thumbnail,
    tags: JSON.stringify(tags),
  });
  return {
    ...product,
    images: JSON.parse(product.images),
    tags: JSON.parse(product.tags),
  };
};
