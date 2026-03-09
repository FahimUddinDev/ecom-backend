import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../utils/customError";
import * as cartService from "./cart.service";

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, variantId, quantity } = req.body;

    const { user } = req as Request & {
      user: { data: { id: number } };
    };

    const product = await cartService.getProduct(+productId);

    if (!product) {
      throw new HttpError("Product not found!", 404);
    }

    if (product.sellerId === user.data.id) {
      throw new HttpError("You can't add your own product to cart!", 400);
    }

    const cart = await cartService.createCart({
      productId: +productId,
      userId: user.data.id,
      variantId: variantId ? +variantId : undefined,
      quantity: +quantity,
    });

    return res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Request & {
      user: { data: { id: number } };
    };

    const cart = await cartService.getCartItem({ id: +req.params.id });

    if (cart.userId !== user.data.id) {
      throw new HttpError("You can't update this cart item!", 403);
    }

    const { quantity } = req.body;

    const updated = await cartService.updateCartItem({
      id: +req.params.id,
      quantity: +quantity,
    });

    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Request & {
      user: { data: { id: number } };
    };

    const cart = await cartService.getCartItem({ id: +req.params.id });

    if (cart.userId !== user.data.id) {
      throw new HttpError("You can't delete this cart item!", 403);
    }

    await cartService.deleteCartItem({ id: +req.params.id });

    return res.status(204).json({ message: "Cart item removed successfully." });
  } catch (err) {
    next(err);
  }
};

export const getCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(422).json({ message: "Invalid cart item id." });
    }

    const cart = await cartService.getCartItem({ id });

    return res.json(cart);
  } catch (err) {
    next(err);
  }
};

export const getCartItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, userId, productId } = req.query;

    const finalQuery = Object.fromEntries(
      Object.entries({ page, limit, userId, productId }).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const carts = await cartService.getCartItems(finalQuery);
    return res.status(200).json(carts);
  } catch (err) {
    next(err);
  }
};

export const addManyCarts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Request & { user: { data: { id: number } } };
    const { items } = req.body as {
      items: { productId: number; variantId?: number; quantity: number }[];
    };

    const carts = await cartService.createCarts({
      userId: user.data.id,
      items,
    });

    return res.status(201).json(carts);
  } catch (err) {
    next(err);
  }
};

export const deleteCartItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Request & { user: { data: { id: number } } };
    const { ids } = req.body as { ids: number[] };

    const result = await cartService.deleteCartItems({
      ids,
      userId: user.data.id,
    });

    return res
      .status(200)
      .json({
        message: "Cart items removed successfully",
        deleted: result.count,
      });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Request & { user: { data: { id: number } } };

    const result = await cartService.clearCart({ userId: user.data.id });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
