import { Prisma, PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/customError";
import * as productModel from "./products.model";

export const createProduct = async ({
  sellerId,
  name,
  shortDescription,
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
  slug,
}: {
  sellerId: number;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  price: Prisma.Decimal;
  currency: string;
  sku: string | null;
  stockQuantity: number;
  categoryId: number;
  subCategoryId: number;
  childCategoryId: number;
  hasVariants: string;
  images: string[];
  thumbnail: string;
  tags: string[];
  slug: string;
}) => {
  const variant = hasVariants === "true";
  const product = await productModel.createProduct({
    seller: { connect: { id: +sellerId } },
    name,
    shortDescription,
    description,
    price,
    currency,
    sku,
    slug,
    stockQuantity: Number(stockQuantity),
    category: { connect: { id: +categoryId } },
    subCategory: { connect: { id: +subCategoryId } },
    childCategory: { connect: { id: +childCategoryId } },
    hasVariants: hasVariants === "true",
    images,
    thumbnail,
    tags,
  });
  return {
    ...product,
  };
};

export const getProducts = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subCategory?: string;
  childCategory?: string;
  sellerId?: string;
  priceRange?: { min?: string; max?: string };
  inStock?: string;
  rating?: string;
  sortBy?: string;
  tags?: string;
  popularity?: string;
  trendingScore?: string;
  createdAt?: string | { from?: string; to?: string };
  orderBy?: "asc" | "desc";
}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.search) {
    const keyword = query.search.trim();
    where.OR = [
      { name: { contains: keyword } },
      { shortDescription: { contains: keyword } },
      { description: { contains: keyword } },
      { tags: { contains: keyword } },
    ];
  }

  if (query.tags && query.tags.length > 0) {
    where.OR = [
      ...(where.OR || []),
      ...query.tags.split(",").map((tag) => ({
        tags: { contains: tag },
      })),
    ];
  }

  if (query.category) where.categoryId = Number(query.category);
  if (query.subCategory) where.subCategoryId = Number(query.subCategory);
  if (query.childCategory) where.childCategoryId = Number(query.childCategory);
  if (query.sellerId) where.sellerId = Number(query.sellerId);
  if (query.inStock === "true") {
    where.stockQuantity = { gt: 0 };
  }
  if (query.rating) {
    where.averageRating = { gte: Number(query.rating) };
  }
  if (query.priceRange) {
    const { min, max } = query.priceRange;
    where.price = {};
    if (min) where.price.gte = Number(min);
    if (max) where.price.lte = Number(max);
  }

  // createdAt filter
  if (query.createdAt) {
    if (typeof query.createdAt === "string") {
      where.createdAt = { equals: new Date(query.createdAt) };
    } else if (typeof query.createdAt === "object") {
      where.createdAt = {};
      if (query.createdAt.from) {
        where.createdAt.gte = new Date(query.createdAt.from);
      }
      if (query.createdAt.to) {
        where.createdAt.lte = new Date(query.createdAt.to);
      }
    }
  }
  let orderBy: any[] = [];

  if (query.sortBy) {
    const fields = query.sortBy.split(",");
    const direction = query.orderBy === "asc" ? "asc" : "desc";

    orderBy.push(
      ...fields.map((field) => ({
        [field]: direction,
      }))
    );
  } else {
    orderBy.push({ createdAt: "desc" });
  }

  // 🔥 Get total count before pagination
  const total = await productModel.countProducts({ where });
  const products = await productModel.findProducts({
    where,
    skip,
    take: limit,
    orderBy,
    select: {
      id: true,
      seller: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      slug: true,
      name: true,
      soldQuantity: true,
      shortDescription: true,
      description: true,
      orders: true,
      price: true,
      currency: true,
      sku: true,
      stockQuantity: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      subCategory: {
        select: {
          id: true,
          name: true,
        },
      },
      childCategory: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
      images: true,
      thumbnail: true,
      tags: true,
      additionalInfo: true,
      variants: true,
      averageRating: true,
      reviews: true,
    },
  });
  return {
    total,
    page,
    limit,
    products,
  };
};

export const updateProduct = async (
  id: number,
  data: Partial<{
    sellerId: number;
    name: string;
    shortDescription: string;
    description: string;
    price: Prisma.Decimal;
    currency: string;
    sku: string;
    stockQuantity: number;
    categoryId: number;
    subCategoryId: number;
    childCategoryId: number;
    hasVariants: boolean;
    images: string[];
    imagesToRemove?: string[];
    thumbnail: string;
    tags: string[];
  }>
) => {
  const existingProduct = await productModel.findProduct({ where: { id } });
  if (!existingProduct) throw new Error("Product not found");

  // Handle thumbnail replacement
  if (data.thumbnail && existingProduct.thumbnail) {
    const oldThumbnailPath = existingProduct.thumbnail.replace("/public/", "");
    const filePath = path.join(
      __dirname,
      "../../../../uploads",
      oldThumbnailPath
    );

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Failed to delete old thumbnail:", err);
        });
      }
    });
  }

  // Handle image removal
  if (data.imagesToRemove && Array.isArray(data.imagesToRemove)) {
    for (const imgUrl of data.imagesToRemove) {
      const fileName = imgUrl.replace("/public/", "");
      const filePath = path.join(__dirname, "../../../uploads", fileName);
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete image:", err);
          });
        }
      });
    }

    // Remove these from existing image list
    const remainingImages = Array.isArray(existingProduct.images)
      ? (existingProduct.images as string[]).filter(
          (img) => !data.imagesToRemove!.includes(img)
        )
      : [];

    // Combine remaining with new uploads
    data.images = [
      ...remainingImages,
      ...(Array.isArray(data.images) ? data.images : []),
    ];
  } else if (data.images && Array.isArray(data.images)) {
    const existingImages = Array.isArray(existingProduct.images)
      ? (existingProduct.images as string[])
      : [];
    data.images = [...existingImages, ...data.images];
  }

  // Remove non-schema fields and normalize data
  const {
    imagesToRemove,
    sellerId,
    categoryId,
    subCategoryId,
    childCategoryId,
    ...rest
  } = data;

  const normalizedData = {
    ...rest,
    ...(data.stockQuantity !== undefined && {
      stockQuantity: Number(data.stockQuantity),
    }),
    ...(data.price !== undefined && {
      price:
        data.price instanceof Prisma.Decimal
          ? data.price
          : new Prisma.Decimal(data.price),
    }),
    ...(data.hasVariants !== undefined && {
      hasVariants:
        typeof data.hasVariants === "boolean"
          ? data.hasVariants
          : data.hasVariants === "true",
    }),
    ...(sellerId && {
      seller: {
        connect: { id: Number(sellerId) },
      },
    }),
    ...(categoryId && {
      category: {
        connect: { id: Number(categoryId) },
      },
    }),
    ...(subCategoryId && {
      subCategory: {
        connect: { id: Number(subCategoryId) },
      },
    }),
    ...(childCategoryId && {
      childCategory: {
        connect: { id: Number(childCategoryId) },
      },
    }),
  };

  const updatedProduct = await productModel.updateProduct(id, normalizedData);

  return updatedProduct;
};

export const getProduct = async (query: { id: number } | { slug: string }) => {
  const product = await productModel.findProduct({
    where: query,
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      description: true,
      price: true,
      orders: true,
      currency: true,
      sku: true,
      stockQuantity: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      subCategory: {
        select: {
          id: true,
          name: true,
        },
      },
      childCategory: {
        select: {
          id: true,
          name: true,
        },
      },
      hasVariants: true,
      images: true,
      thumbnail: true,
      tags: true,
      additionalInfo: true,
      variants: true,
      averageRating: true,
      reviews: true,
      createdAt: true,
      updatedAt: true,
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
  if (!product) throw new HttpError("Product Not found!", 404);
  return product;
};

export const deleteProduct = async ({
  id,
  role,
  authId,
}: {
  id: number;
  authId: number;
  role: string;
}) => {
  const product = await productModel.findProduct({ where: { id } });
  if (!product) throw new HttpError("Product not found!", 404);

  const activeOrderCount = await productModel.countOrders({
    where: { productId: id, status: "active" },
  });

  if (activeOrderCount > 0) {
    throw new HttpError(
      "Cannot delete product with active orders. Please resolve orders first.",
      400
    );
  }

  const orderCount = await productModel.countOrders({
    where: { productId: id },
  });

  if (role !== "admin" && !(role === "seller" && product.sellerId === authId)) {
    throw new HttpError("Permission denied!", 403);
  }

  if (orderCount > 0) {
    return productModel.updateProduct(id, { status: "draft" });
  }

  await prisma.$transaction(async (tx: PrismaClient) => {
    await tx.additionalInfo.deleteMany({
      where: { productId: id },
    });

    await tx.variant.deleteMany({
      where: { productId: id },
    });

    await tx.offerOnProduct.deleteMany({
      where: { productId: id },
    });

    await tx.couponOnProduct.deleteMany({
      where: { productId: id },
    });
    await tx.product.delete({
      where: { id },
    });
  });

  return { message: "Product and related data deleted successfully" };
};
