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

  const activeOrderCount = await variantModel.countOrders({
    where: { variantId: id, status: "active" },
  });

  if (activeOrderCount > 0) {
    throw new HttpError(
      "Cannot delete variant with active orders. Please resolve orders first.",
      400,
    );
  }

  const orderCount = await variantModel.countOrders({
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
