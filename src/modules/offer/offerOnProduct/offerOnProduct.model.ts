import { Offer, OfferOnProduct, Prisma, Product } from "@prisma/client";
import { prisma } from "../../../config/prisma";

export const findProduct = async (
  query: Prisma.ProductFindUniqueArgs,
): Promise<Product | null> => {
  return prisma.product.findUnique(query);
};

export const findOffer = async (query: Prisma.OfferFindUniqueArgs) => {
  return prisma.offer.findUnique({
    ...query,
  });
};

export const createOfferOnProduct = async (
  data: Prisma.OfferOnProductCreateInput,
): Promise<OfferOnProduct> => {
  return prisma.offerOnProduct.create({ data });
};

export const createManyOfferOnProducts = (
  data: Prisma.OfferOnProductCreateManyInput[],
) => {
  return prisma.OfferOnProduct.createMany({ data });
};

export const updateOfferOnProduct = async (
  id: number,
  data: Prisma.OfferOnProductUpdateInput,
): Promise<OfferOnProduct> => {
  return prisma.offerOnProduct.update({
    where: { id: +id },
    data,
  });
};

export const findOfferOnProduct = async (
  query: Prisma.OfferOnProductFindUniqueArgs,
): Promise<OfferOnProduct | null> => {
  return prisma.offerOnProduct.findUnique(query);
};

export const deleteOfferOnProduct = async (id: number): Promise<Offer> => {
  return prisma.offerOnProduct.delete({ where: { id } });
};

export const findOfferOnProducts = async (
  query: Prisma.OfferOnProductFindManyArgs,
): Promise<OfferOnProduct[]> => {
  return prisma.offerOnProduct.findMany(query);
};

export const countOfferOnProducts = async (
  query: Prisma.OfferOnProductCountArgs,
): Promise<number> => {
  return prisma.offerOnProduct.count(query);
};
