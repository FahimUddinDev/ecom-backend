import { Prisma, Product, Wishlist } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findProduct = async (
  query: Prisma.ProductFindUniqueArgs,
): Promise<Product | null> => {
  return prisma.product.findUnique(query);
};

export const createWishlist = async (data: {
  productId: number;
  userId: number;
}): Promise<Wishlist> => {
  const { productId, userId } = data;

  const prismaData: Prisma.WishlistCreateInput = {
    user: { connect: { id: userId } },
    product: { connect: { id: productId } },
  };

  return prisma.wishlist.create({
    data: prismaData,
    include: {
      product: true,
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
    },
  });
};

export const deleteWishlist = async (id: number): Promise<Wishlist> => {
  return prisma.wishlist.delete({
    where: { id },
  });
};

export const findWishlist = async (
  query: Prisma.WishlistFindUniqueArgs,
): Promise<Wishlist | null> => {
  return prisma.wishlist.findUnique(query);
};

export const findWishlists = async (
  query: Prisma.WishlistFindManyArgs,
): Promise<Wishlist[]> => {
  return prisma.wishlist.findMany({
    ...query,
    include: {
      product: true,
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
    },
  });
};

export const countWishlists = async (
  query: Prisma.WishlistCountArgs,
): Promise<number> => {
  return prisma.wishlist.count(query);
};
