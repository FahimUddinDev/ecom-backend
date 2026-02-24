import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../utils/customError";
import * as wishlistService from "./wishlist.service";

export const createWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.body;

    const { user } = req as Request & {
      user: { data: { id: number } };
    };

    const product = await wishlistService.getProduct(+productId);

    if (!product) {
      throw new HttpError("Product not found!", 404);
    }

    if (product.sellerId === user.data.id) {
      throw new HttpError("You can't add your own product to wishlist!", 400);
    }

    const wishlist = await wishlistService.createWishlist({
      productId: +productId,
      userId: user.data.id,
    });

    return res.status(201).json(wishlist);
  } catch (err) {
    next(err);
  }
};

export const deleteWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { user } = req as Request & {
    user: { data: { id: number } };
  };

  const wishlist = await wishlistService.getWishlist({
    id: +req.params.id,
  });

  if (!wishlist) {
    throw new HttpError("Wishlist not found!", 404);
  }

  if (wishlist.userId !== user.data.id) {
    throw new HttpError("You can't delete this wishlist!", 403);
  }

  try {
    await wishlistService.deleteWishlist({
      id: +req.params.id,
    });
    res.status(204).json({ message: "Deleted wishlist successfully." });
  } catch (err) {
    next(err);
  }
};

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(422).json({
        message: "Invalid coupon id.",
      });
    }

    const wishlist = await wishlistService.getWishlist({
      id,
    });

    return res.json(wishlist);
  } catch (err) {
    next(err);
  }
};

export const getWishlists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, userId, productId } = await req.query;

    const finalQuery = Object.fromEntries(
      Object.entries({
        page,
        limit,
        userId,
        productId,
      }).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
    const wishlists = await wishlistService.getWishlists(finalQuery);
    res.status(200).json(wishlists);
  } catch (err) {
    next(err);
  }
};
