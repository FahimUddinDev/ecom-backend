import { Offer, Prisma, Product } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findProduct = async (
  query: Prisma.ProductFindUniqueArgs,
): Promise<Product | null> => {
  return prisma.product.findUnique(query);
};

export const createOffer = async (
  data: Prisma.OfferCreateInput,
): Promise<Offer> => {
  return prisma.offer.create({ data });
};

export const updateOffer = async (
  id: number,
  data: Prisma.OfferUpdateInput,
): Promise<Offer> => {
  return prisma.offer.update({
    where: { id: +id },
    data,
  });
};

export const findOffer = async (
  query: Prisma.OfferFindUniqueArgs,
): Promise<Offer | null> => {
  return prisma.offer.findUnique(query);
};

export const deleteOffer = async (id: number): Promise<Offer> => {
  return prisma.offer.delete({ where: { id } });
};

export const findOffers = async (
  query: Prisma.OfferFindManyArgs,
): Promise<Offer[]> => {
  return prisma.offer.findMany(query);
};

export const countOffers = async (
  query: Prisma.OfferCountArgs,
): Promise<number> => {
  return prisma.offer.count(query);
};
