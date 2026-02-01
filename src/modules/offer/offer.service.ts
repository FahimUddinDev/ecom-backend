import { DiscountType, OfferType, Status } from "@prisma/client";
import { HttpError } from "../../utils/customError";
import * as offerModel from "./offer.model";

export const getProduct = async (productId: number) => {
  const product = await offerModel.findProduct({
    where: { id: +productId },
    select: {
      id: true,
      sellerId: true,
    },
  });
  if (!product) throw new Error("Product not found");
  return product;
};

export const createOffer = async ({
  name,
  sellerId,
  offerType,
  discountType,
  status,
  discountValue,
  startDate,
  endDate,
}: {
  sellerId?: number | undefined;
  name: string;
  offerType: OfferType;
  discountType: DiscountType;
  status?: Status;
  discountValue: number;
  startDate: string;
  endDate: string;
}) => {
  let offer = {};
  if (sellerId) {
    offer = await offerModel.createOffer({
      name,
      sellerId,
      offerType,
      discountType,
      status,
      discountValue,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  } else {
    offer = await offerModel.createOffer({
      name,
      offerType,
      discountType,
      status,
      discountValue,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  }

  return {
    ...offer,
  };
};

export const updateOffer = async (
  id: number,
  data: Partial<{
    sellerId?: number;
    name: string;
    offerType: OfferType;
    discountType: DiscountType;
    status?: Status;
    discountValue: number;
    startDate: string;
    endDate: string;
  }>,
) => {
  const existingOffer = await offerModel.findOffer({
    where: { id },
  });
  if (!existingOffer) throw new Error("Offer not found");

  const normalizedData = {
    ...data,
    ...(data.sellerId !== undefined && {
      sellerId: Number(data.sellerId),
    }),
  };

  const updatedOffer = await offerModel.updateOffer(id, normalizedData);

  return updatedOffer;
};

export const deleteOffer = async ({
  id,
  role,
  authId,
}: {
  id: number;
  authId: number;
  role: string;
}) => {
  const offer = await offerModel.findOffer({
    where: { id },
    select: {
      sellerId: true,
    },
  });
  if (!offer) throw new HttpError("Offer not found!", 404);

  if (role !== "admin" && !(role === "seller" && offer.sellerId === authId)) {
    throw new HttpError("Permission denied!", 403);
  }

  await offerModel.deleteOffer(id);

  return { message: "Offer deleted successfully" };
};

export const getOffer = async (query: { id: number }) => {
  const offer = await offerModel.findOffer({
    where: query,
    select: {
      id: true,
      name: true,
      sellerId: true,
      offerType: true,
      discountType: true,
      status: true,
      discountValue: true,
      startDate: true,
      endDate: true,
    },
  });
  if (!offer) throw new HttpError("Offer Not found!", 404);
  return offer;
};

export const getOffers = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  sellerId?: string;
  sortBy?: string;
  createdAt?: string | { from?: string; to?: string };
  startDate?: string | { from?: string; to?: string };
  endDate?: string | { from?: string; to?: string };
  orderBy?: "asc" | "desc";
}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.search) {
    const keyword = query.search.trim();
    where.OR = [{ name: { contains: keyword } }];
  }
  if (query.sellerId) where.sellerId = Number(query.sellerId);

  // createdAt filter
  if (query.createdAt) {
    if (typeof query.createdAt === "string") {
      where.createdAt = { equals: new Date(query.createdAt) };
    } else if (typeof query.createdAt === "object") {
      where.createdAt = {};
      if (query.createdAt.from) {
        where.createdAt.gte = new Date(query.createdAt.from);
      }
      if (query.createdAt.to) {
        where.createdAt.lte = new Date(query.createdAt.to);
      }
    }
  }
  // start at filter
  if (query.startDate) {
    if (typeof query.startDate === "string") {
      where.startDate = { equals: new Date(query.startDate) };
    } else if (typeof query.startDate === "object") {
      where.startDate = {};
      if (query.startDate.from) {
        where.startDate.gte = new Date(query.startDate.from);
      }
      if (query.startDate.to) {
        where.startDate.lte = new Date(query.startDate.to);
      }
    }
  }

  // end date filter
  // start at filter
  if (query.endDate) {
    if (typeof query.endDate === "string") {
      where.endDate = { equals: new Date(query.endDate) };
    } else if (typeof query.endDate === "object") {
      where.endDate = {};
      if (query.endDate.from) {
        where.endDate.gte = new Date(query.endDate.from);
      }
      if (query.endDate.to) {
        where.endDate.lte = new Date(query.endDate.to);
      }
    }
  }
  let orderBy: any[] = [];

  if (query.sortBy) {
    const fields = query.sortBy.split(",");
    const direction = query.orderBy === "asc" ? "asc" : "desc";

    orderBy.push(
      ...fields.map((field) => ({
        [field]: direction,
      })),
    );
  } else {
    orderBy.push({ createdAt: "desc" });
  }

  //  Get total count before pagination
  const total = await offerModel.countOffers({ where });
  const offers = await offerModel.findOffers({
    where,
    skip,
    take: limit,
    orderBy,
    select: {
      id: true,
      name: true,
      sellerId: true,
      offerType: true,
      discountType: true,
      status: true,
      discountValue: true,
      startDate: true,
      endDate: true,
    },
  });
  return {
    total,
    page,
    limit,
    offers,
  };
};
