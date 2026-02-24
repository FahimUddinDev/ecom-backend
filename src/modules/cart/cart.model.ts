import { Cart, Prisma, Product } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findProduct = async (
  query: Prisma.ProductFindUniqueArgs,
): Promise<Product | null> => {
  return prisma.product.findUnique(query);
};

const cartInclude = {
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
      kyc: {
        select: {
          status: true,
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

export const createCart = async (data: {
  productId: number;
  userId: number;
  variantId?: number;
  quantity: number;
}): Promise<Cart> => {
  const { productId, userId, variantId, quantity } = data;

  const prismaData: Prisma.CartCreateInput = {
    user: { connect: { id: userId } },
    product: { connect: { id: productId } },
    ...(variantId ? { variant: { connect: { id: variantId } } } : {}),
    quantity,
  };

  return prisma.cart.create({
    data: prismaData,
    include: cartInclude,
  });
};

export const updateCart = async (
  id: number,
  quantity: number,
): Promise<Cart> => {
  return prisma.cart.update({
    where: { id },
    data: { quantity },
    include: cartInclude,
  });
};

export const deleteCart = async (id: number): Promise<Cart> => {
  return prisma.cart.delete({
    where: { id },
  });
};

// Bulk create — each item is upserted inside a transaction
export const createManyCarts = async (
  items: {
    productId: number;
    userId: number;
    variantId?: number;
    quantity: number;
  }[],
): Promise<Cart[]> => {
  const results: Cart[] = [];

  for (const item of items) {
    const existing = await prisma.cart.findFirst({
      where: {
        userId: item.userId,
        productId: item.productId,
        variantId: item.variantId ?? null,
      },
    });

    if (existing) {
      results.push(
        await prisma.cart.update({
          where: { id: existing.id },
          data: { quantity: { increment: item.quantity } },
          include: cartInclude,
        }),
      );
    } else {
      results.push(
        await prisma.cart.create({
          data: {
            user: { connect: { id: item.userId } },
            product: { connect: { id: item.productId } },
            ...(item.variantId
              ? { variant: { connect: { id: item.variantId } } }
              : {}),
            quantity: item.quantity,
          },
          include: cartInclude,
        }),
      );
    }
  }

  return results;
};

// Bulk delete by array of ids
export const deleteManyCarts = async (
  ids: number[],
): Promise<Prisma.BatchPayload> => {
  return prisma.cart.deleteMany({
    where: { id: { in: ids } },
  });
};

// Clear all cart items for a user
export const clearUserCart = async (
  userId: number,
): Promise<Prisma.BatchPayload> => {
  return prisma.cart.deleteMany({
    where: { userId },
  });
};

export const findCart = async (
  query: Prisma.CartFindFirstArgs,
): Promise<Cart | null> => {
  return prisma.cart.findFirst(query);
};

export const findCarts = async (
  query: Prisma.CartFindManyArgs,
): Promise<Cart[]> => {
  return prisma.cart.findMany({
    ...query,
    include: cartInclude,
  });
};

export const countCarts = async (
  query: Prisma.CartCountArgs,
): Promise<number> => {
  return prisma.cart.count(query);
};
