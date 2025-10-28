import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import * as productsService from "./products.service";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
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
    } = req.body;

    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };

    if (user.data.role === "admin" || user.data.role === "seller") {
      if (user.data.role === "seller" && sellerId && sellerId != user.data.id) {
        return res
          .status(403)
          .json({ message: "Only you can create products for yourself." });
      }
      const slug =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "") + `-${Date.now()}`;
      const product = await productsService.createProduct({
        sellerId: sellerId || user.data.id,
        name,
        slug,
        shortDescription: shortDescription ?? null,
        description: description ?? null,
        price: new Prisma.Decimal(price),
        currency,
        sku: sku ?? null,
        stockQuantity,
        categoryId,
        subCategoryId,
        childCategoryId,
        hasVariants,
        images,
        thumbnail,
        tags,
      });

      res.status(201).json(product);
    } else {
      return res
        .status(403)
        .json({ message: "You don't have permission to create products." });
    }
  } catch (err) {
    next(err);
  }
};
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await req.query;
    const products = await productsService.getProducts(query);
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
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
      imagesToRemove,
      thumbnail,
      tags,
    } = req.body;
    const updateData = Object.fromEntries(
      Object.entries({
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
        imagesToRemove,
        thumbnail,
        tags,
      }).filter(([_, value]) => value !== undefined)
    );
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };

    if (user.data.role === "admin" || user.data.role === "seller") {
      if (user.data.role === "seller" && sellerId && sellerId != user.data.id) {
        return res
          .status(403)
          .json({ message: "Only you can create products for yourself." });
      }

      if (updateData.price !== undefined) {
        updateData.price = new Prisma.Decimal(updateData.price);
      }

      const product = await productsService.updateProduct(
        +req.params.id,
        updateData
      );

      res.status(201).json(product);
    } else {
      return res
        .status(403)
        .json({ message: "You don't have permission to create products." });
    }
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await req.params.id;
    let product;
    if (parseInt(query)) {
      product = await productsService.getProduct({ id: +query });
    } else {
      product = await productsService.getProduct({ slug: query });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    await productsService.deleteProduct({
      id: +req.params.id,
      role: user.data.role,
      authId: user.data.id,
    });
    res.status(204).json({ message: "Deleted product successfully." });
  } catch (err) {
    next(err);
  }
};
