import { Prisma } from "@prisma/client";
import { HttpError } from "../../utils/customError";
import * as cartModel from "./cart.model";

export const getProduct = async (productId: number) => {
  const product = await cartModel.findProduct({
    where: { id: +productId },
    select: {
      id: true,
      sellerId: true,
    },
  });
  if (!product) throw new HttpError("Product not found", 404);
  return product;
};

export const createCart = async ({
  productId,
  userId,
  variantId,
  quantity,
}: {
  productId: number;
  userId: number;
  variantId?: number;
  quantity: number;
}) => {
  // Check if the item already exists in the cart
  const existing = await cartModel.findCart({
    where: {
      userId,
      productId,
      variantId: variantId ?? null,
    },
  });

  if (existing) {
    // Update quantity instead of creating a duplicate
    return cartModel.updateCart(existing.id, existing.quantity + quantity);
  }

  return cartModel.createCart({ productId, userId, variantId, quantity });
};

export const updateCartItem = async ({
  id,
  quantity,
}: {
  id: number;
  quantity: number;
}) => {
  const cart = await cartModel.findCart({ where: { id } });

  if (!cart) {
    throw new HttpError("Cart item not found!", 404);
  }

  return cartModel.updateCart(id, quantity);
};

export const deleteCartItem = async ({ id }: { id: number }) => {
  const cart = await cartModel.findCart({ where: { id } });

  if (!cart) {
    throw new HttpError("Cart item not found!", 404);
  }

  await cartModel.deleteCart(id);

  return { message: "Cart item removed successfully" };
};

export const getCartItem = async (query: { id: number }) => {
  const cart = await cartModel.findCart({
    where: { id: query.id },
    include: {
      product: true,
      variant: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          role: true,
          status: true,
          verified: true,
          avatar: true,
          kyc: { select: { status: true } },
        },
      },
    },
  });

  if (!cart) {
    throw new HttpError("Cart item not found!", 404);
  }

  return cart;
};

export const getCartItems = async (query: {
  page?: string;
  limit?: string;
  userId?: string;
  productId?: string;
}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const where: Prisma.CartWhereInput = {};

  // user filter
  if (query.userId) {
    where.userId = Number(query.userId);
  }

  // product filter
  if (query.productId) {
    where.productId = Number(query.productId);
  }

  // Sorting
  const orderBy: Prisma.CartOrderByWithRelationInput[] = [];
  orderBy.push({ createdAt: "desc" });

  // Total count
  const total = await cartModel.countCarts({ where });

  // Fetch cart items
  const carts = await cartModel.findCarts({
    where,
    skip,
    take: limit,
    orderBy,
  });

  return {
    total,
    page,
    limit,
    carts,
  };
};

export const createCarts = async ({
  userId,
  items,
}: {
  userId: number;
  items: { productId: number; variantId?: number; quantity: number }[];
}) => {
  // Validate all products exist and none belong to the user
  for (const item of items) {
    const product = await cartModel.findProduct({
      where: { id: item.productId },
      select: { id: true, sellerId: true },
    });
    if (!product)
      throw new HttpError(`Product ${item.productId} not found`, 404);
    if (product.sellerId === userId)
      throw new HttpError(
        `You can't add your own product (id: ${item.productId}) to cart`,
        400,
      );
  }

  return cartModel.createManyCarts(items.map((item) => ({ ...item, userId })));
};

export const deleteCartItems = async ({
  ids,
  userId,
}: {
  ids: number[];
  userId: number;
}) => {
  // Ownership check
  const existing = await cartModel.findCarts({ where: { id: { in: ids } } });
  const unauthorised = existing.filter((c) => c.userId !== userId);
  if (unauthorised.length > 0)
    throw new HttpError("You don't own one or more of these cart items", 403);

  return cartModel.deleteManyCarts(ids);
};

export const clearCart = async ({ userId }: { userId: number }) => {
  const result = await cartModel.clearUserCart(userId);
  return { message: "Cart cleared successfully", deleted: result.count };
};
