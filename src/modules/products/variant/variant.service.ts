import { Prisma, PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { prisma } from "../../../config/prisma";
import { HttpError } from "../../../utils/customError";
import * as variantModel from "./variant.model";

export const getProduct = async (productId: number) => {
  const product = await variantModel.findProduct({
    where: { id: +productId },
    select: {
      id: true,
      hasVariants: true,
      sellerId: true,
    },
  });
  if (!product) throw new Error("Product not found");
  return product;
};

export const createVariant = async ({
  sellerId,
  productId,
  price,
  currency,
  sku,
  stockQuantity,
  name,
  images,
  thumbnail,
  type,
}: {
  productId: number;
  sellerId: number;
  name: string;
  price: Prisma.Decimal;
  currency: string;
  sku: string | null;
  stockQuantity: number;
  images: string[];
  thumbnail: string;
  type: string;
}) => {
  const variant = await variantModel.createVariant({
    product: { connect: { id: +productId } },
    seller: { connect: { id: +sellerId } },
    type,
    name,
    price,
    currency,
    sku,
    stockQuantity: Number(stockQuantity),
    images,
    thumbnail,
  });
  return {
    ...variant,
  };
};

export const updateVariant = async (
  id: number,
  data: Partial<{
    sellerId: number;
    productId: number;
    name: string;
    price: Prisma.Decimal;
    currency: string;
    sku: string;
    stockQuantity: number;
    images: string[];
    imagesToRemove?: string[];
    thumbnail: string;
  }>,
) => {
  const existingVariant = await variantModel.findVariant({ where: { id } });
  if (!existingVariant) throw new Error("Variant not found");

  // Handle thumbnail replacement
  if (data.thumbnail && existingVariant.thumbnail) {
    const oldThumbnailPath = existingVariant.thumbnail.replace("/public/", "");
    const filePath = path.join(
      __dirname,
      "../../../../uploads",
      oldThumbnailPath,
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
    const remainingImages = Array.isArray(existingVariant.images)
      ? (existingVariant.images as string[]).filter(
          (img) => !data.imagesToRemove!.includes(img),
        )
      : [];

    // Combine remaining with new uploads
    data.images = [
      ...remainingImages,
      ...(Array.isArray(data.images) ? data.images : []),
    ];
  } else if (data.images && Array.isArray(data.images)) {
    const existingImages = Array.isArray(existingVariant.images)
      ? (existingVariant.images as string[])
      : [];
    data.images = [...existingImages, ...data.images];
  }

  // Remove non-schema fields and normalize data
  const { imagesToRemove, ...rest } = data;

  const normalizedData = {
    ...rest,
    ...(data.stockQuantity !== undefined && {
      stockQuantity: Number(data.stockQuantity),
    }),
    ...(data.productId !== undefined && {
      productId: Number(data.productId),
    }),
    ...(data.sellerId !== undefined && {
      sellerId: Number(data.sellerId),
    }),
    ...(data.price !== undefined && {
      price:
        data.price instanceof Prisma.Decimal
          ? data.price
          : new Prisma.Decimal(data.price),
    }),
  };

  const updatedVariant = await variantModel.updateVariant(id, normalizedData);

  return updatedVariant;
};

export const deleteVariant = async ({
  id,
  role,
  authId,
}: {
  id: number;
  authId: number;
  role: string;
}) => {
  const variant = await variantModel.findVariant({ where: { id } });
  if (!variant) throw new HttpError("Variant not found!", 404);

  const activeOrderCount = await prisma.orderItem.count({
    where: { variantId: id, order: { status: "pending" } },
  });

  if (activeOrderCount > 0) {
    throw new HttpError(
      "Cannot delete variant with active orders. Please resolve orders first.",
      400,
    );
  }

  const orderCount = await prisma.orderItem.count({
    where: { variantId: id },
  });

  if (role !== "admin" && !(role === "seller" && variant.sellerId === authId)) {
    throw new HttpError("Permission denied!", 403);
  }

  if (orderCount > 0) {
    return variantModel.updateVariant(id, { status: "draft" });
  }

  await prisma.$transaction(async (tx: PrismaClient) => {
    await tx.offerOnVariant.deleteMany({
      where: { variantId: id },
    });

    await tx.couponOnVariant.deleteMany({
      where: { variantId: id },
    });
    await tx.variant.delete({
      where: { id },
    });
  });

  return { message: "Variant and related data deleted successfully" };
};

export const getVariant = async (query: { id: number }) => {
  const variant = await variantModel.findVariant({
    where: query,
    select: {
      id: true,
      name: true,
      price: true,
      orderItems: true,
      currency: true,
      sku: true,
      stockQuantity: true,
      images: true,
      thumbnail: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!variant) throw new HttpError("Variant Not found!", 404);
  return variant;
};

export const getVariants = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  sellerId?: string;
  productId?: string;
  priceRange?: { min?: string; max?: string };
  inStock?: string;
  sortBy?: string;
  createdAt?: string | { from?: string; to?: string };
  orderBy?: "asc" | "desc";
}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.search) {
    const keyword = query.search.trim();
    where.OR = [{ name: { contains: keyword } }];
  }
  if (query.sellerId) where.sellerId = Number(query.sellerId);
  if (query.productId) where.productId = Number(query.productId);
  if (query.inStock === "true") {
    where.stockQuantity = { gt: 0 };
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
      })),
    );
  } else {
    orderBy.push({ createdAt: "desc" });
  }

  //  Get total count before pagination
  const total = await variantModel.countVariants({ where });
  const variants = await variantModel.findVariants({
    where,
    skip,
    take: limit,
    orderBy,
    select: {
      id: true,
      name: true,
      soldQuantity: true,
      orderItems: true,
      price: true,
      currency: true,
      sku: true,
      stockQuantity: true,
      createdAt: true,
      updatedAt: true,
      images: true,
      thumbnail: true,
    },
  });
  return {
    total,
    page,
    limit,
    variants,
  };
};
