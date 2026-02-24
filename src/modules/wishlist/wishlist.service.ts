import { Prisma } from "@prisma/client";
import { HttpError } from "../../utils/customError";
import * as wishlistModel from "./wishlist.model";

export const getProduct = async (productId: number) => {
  const product = await wishlistModel.findProduct({
    where: { id: +productId },
    select: {
      id: true,
      sellerId: true,
    },
  });
  if (!product) throw new Error("Product not found");
  return product;
};

export const createWishlist = async ({
  productId,
  userId,
}: {
  productId: number;
  userId: number;
}) => {
  return wishlistModel.createWishlist({
    productId,
    userId,
  });
};

export const deleteWishlist = async ({ id }: { id: number }) => {
  const wishlist = await wishlistModel.findWishlist({
    where: { id },
  });

  if (!wishlist) {
    throw new HttpError("Wishlist not found!", 404);
  }

  await wishlistModel.deleteWishlist(id);

  return { message: "Wishlist deleted successfully" };
};

export const getWishlist = async (query: { id: number }) => {
  const wishlist = await wishlistModel.findWishlist({
    where: {
      id: query.id,
    },
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

  if (!wishlist) {
    throw new HttpError("Wishlist Not found!", 404);
  }

  return wishlist;
};

export const getWishlists = async (query: {
  page?: string;
  limit?: string;
  userId?: string;
  productId?: string;
}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const where: Prisma.WishlistWhereInput = {};

  // user filter
  if (query.userId) {
    where.userId = Number(query.userId);
  }

  // product filter
  if (query.productId) {
    where.productId = Number(query.productId);
  }

  // Sorting
  const orderBy: Prisma.WishlistOrderByWithRelationInput[] = [];
  orderBy.push({ createdAt: "desc" });

  // Total count
  const total = await wishlistModel.countWishlists({ where });

  // Fetch offers with products & variants
  const wishlists = await wishlistModel.findWishlists({
    where,
    skip,
    take: limit,
    orderBy,
  });

  return {
    total,
    page,
    limit,
    wishlists,
  };
};
