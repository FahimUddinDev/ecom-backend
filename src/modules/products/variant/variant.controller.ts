// User controller
import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import * as variantService from "./variant.service";

export const createVariant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
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
    } = req.body;

    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };

    const product = await variantService.getProduct(productId);
    if (!product) return res.status(400).json({ message: "Product not found" });

    if (user.data.role === "admin" || user.data.role === "seller") {
      if (user.data.role === "seller" && sellerId && sellerId != user.data.id) {
        return res
          .status(403)
          .json({ message: "Only you can create variants for yourself." });
      }
      if (
        !product?.hasVariants ||
        (sellerId
          ? product.sellerId !== +sellerId
          : product.sellerId !== +user.data.id)
      ) {
        return res
          .status(403)
          .json({ message: "You don't have permission to create variant." });
      }
      const variant = await variantService.createVariant({
        sellerId: sellerId ? sellerId : user.data.id,
        productId,
        price,
        currency,
        sku,
        stockQuantity,
        name,
        images,
        thumbnail,
        type,
      });

      res.status(201).json(variant);
    } else {
      return res
        .status(403)
        .json({ message: "You don't have permission to create variant." });
    }
  } catch (err) {
    next(err);
  }
};

export const updateVariant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      sellerId,
      productId,
      name,
      price,
      currency,
      sku,
      stockQuantity,
      images,
      imagesToRemove,
      thumbnail,
    } = req.body;
    const updateData = Object.fromEntries(
      Object.entries({
        sellerId,
        name,
        price,
        productId,
        currency,
        sku,
        stockQuantity,
        images,
        imagesToRemove,
        thumbnail,
      }).filter(([_, value]) => value !== undefined),
    );
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    const product = await variantService.getProduct(productId);
    if (!product) return res.status(400).json({ message: "Product not found" });

    if (user.data.role === "admin" || user.data.role === "seller") {
      if (user.data.role === "seller" && sellerId && sellerId != user.data.id) {
        return res
          .status(403)
          .json({ message: "Only you can create products for yourself." });
      }
      if (
        !product?.hasVariants ||
        (sellerId
          ? product.sellerId !== +sellerId
          : product.sellerId !== +user.data.id)
      ) {
        return res
          .status(403)
          .json({ message: "You don't have permission to create variant." });
      }

      if (updateData.price !== undefined) {
        updateData.price = new Prisma.Decimal(updateData.price);
      }

      const variant = await variantService.updateVariant(
        +req.params.id,
        updateData,
      );

      res.status(201).json(variant);
    } else {
      return res
        .status(403)
        .json({ message: "You don't have permission to update variant." });
    }
  } catch (err) {
    next(err);
  }
};

export const deleteVariant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    await variantService.deleteVariant({
      id: +req.params.id,
      role: user.data.role,
      authId: user.data.id,
    });
    res.status(204).json({ message: "Deleted variant successfully." });
  } catch (err) {
    next(err);
  }
};

export const getVariant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = await req.params.id;
    let variant;
    if (parseInt(query)) {
      variant = await variantService.getVariant({ id: +query });
    } else {
      res.status(422).json({ message: "Invalid query." });
    }

    res.json(variant);
  } catch (err) {
    next(err);
  }
};

export const getVariants = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      page,
      limit,
      search,
      sellerId,
      productId,
      priceRange,
      inStock,
      sortBy,
      createdAt,
      orderBy,
    } = await req.query;

    const finalQuery = Object.fromEntries(
      Object.entries({
        page,
        limit,
        search,
        sellerId,
        productId,
        priceRange,
        inStock,
        sortBy,
        createdAt,
        orderBy,
      }).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
    const variants = await variantService.getVariants(finalQuery);
    res.status(200).json(variants);
  } catch (err) {
    next(err);
  }
};
