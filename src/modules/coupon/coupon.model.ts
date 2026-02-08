import { Offer, Prisma, Product } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findProduct = async (
  query: Prisma.ProductFindUniqueArgs,
): Promise<Product | null> => {
  return prisma.product.findUnique(query);
};

export const createOffer = async (data: {
  name: string;
  sellerId?: number;
  offerType: Prisma.OfferCreateInput["offerType"];
  discountType: Prisma.OfferCreateInput["discountType"];
  status?: Prisma.OfferCreateInput["status"];
  discountValue: number;
  startDate: Date;
  endDate?: Date;
  productIds?: number[];
  variantIds?: number[];
}): Promise<Offer> => {
  const { productIds = [], variantIds = [], discountValue, ...rest } = data;

  const prismaData: Prisma.OfferCreateInput = {
    ...rest,
    discountValue: new Prisma.Decimal(discountValue),

    products:
      productIds.length > 0
        ? {
            create: productIds.map((productId) => ({
              product: { connect: { id: productId } },
            })),
          }
        : undefined,

    variants:
      variantIds.length > 0
        ? {
            create: variantIds.map((variantId) => ({
              variant: { connect: { id: variantId } },
            })),
          }
        : undefined,
  };

  return prisma.offer.create({
    data: prismaData,
    include: {
      products: true,
      variants: true,
    },
  });
};

export const updateOffer = async (
  id: number,
  data: Prisma.OfferUpdateInput & {
    productIds?: number[];
    variantIds?: number[];
  },
): Promise<Offer> => {
  const { productIds, variantIds, ...rest } = data;

  return prisma.offer.update({
    where: { id },

    data: {
      ...rest,

      // ===== Product Relation Update =====
      products: productIds
        ? {
            deleteMany: {}, // আগের সব relation delete
            create: productIds.map((productId) => ({
              product: {
                connect: { id: productId },
              },
            })),
          }
        : undefined,

      // ===== Variant Relation Update =====
      variants: variantIds
        ? {
            deleteMany: {},
            create: variantIds.map((variantId) => ({
              variant: {
                connect: { id: variantId },
              },
            })),
          }
        : undefined,
    },

    include: {
      products: true,
      variants: true,
    },
  });
};

export const findOffer = async (query: Prisma.OfferFindUniqueArgs) => {
  return prisma.offer.findUnique({
    ...query,
  });
};

export const deleteOffer = async (id: number): Promise<Offer> => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // ===== Delete related products =====
    await tx.offerOnProduct.deleteMany({
      where: {
        offerId: id,
      },
    });

    // ===== Delete related variants =====
    await tx.offerOnVariant.deleteMany({
      where: {
        offerId: id,
      },
    });

    // ===== Finally delete offer =====
    return tx.offer.delete({
      where: { id },
    });
  });
};

export const findOffers = async (
  query: Prisma.OfferFindManyArgs,
): Promise<Offer[]> => {
  return prisma.offer.findMany({
    ...query,
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      variants: {
        include: {
          variant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

export const countOffers = async (
  query: Prisma.OfferCountArgs,
): Promise<number> => {
  return prisma.offer.count(query);
};
