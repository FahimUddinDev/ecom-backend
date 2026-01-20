// User controller
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
      const variant = await variantService.createVariant({
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
