import { DiscountType } from "@prisma/client";
import * as couponModel from "./coupon.model";

export const getProduct = async (productId: number) => {
  const product = await couponModel.findProduct({
    where: { id: +productId },
    select: {
      id: true,
      sellerId: true,
    },
  });
  if (!product) throw new Error("Product not found");
  return product;
};

export const createCoupon = async ({
  code,
  referralCode,
  description,
  discountType,
  discountValue,
  startDate,
  endDate,
  productIds = [],
  variantIds = [],
  sellerId,
  usageLimit,
}: {
  sellerId?: number;
  code: string;
  referralCode: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate?: string;
  productIds?: number[];
  variantIds?: number[];
  usageLimit: number;
}) => {
  return couponModel.createCoupon({
    code,
    referralCode,
    description,
    discountType,
    discountValue,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : undefined,
    productIds,
    variantIds,
    sellerId,
    usageLimit,
  });
};

// export const updateCoupon = async (
//   id: number,
//   data: Partial<{
//     sellerId?: number;
//     code: string;
//     referralCode: string;
//     description: string;
//     discountType: DiscountType;
//     discountValue: number;
//     startDate: string;
//     endDate: string;
//     productIds?: number[];
//     variantIds?: number[];
//   }>,
// ) => {
//   const existingOffer = await offerModel.findOffer({
//     where: { id },
//   });

//   if (!existingOffer) throw new Error("Offer not found");

//   return offerModel.updateOffer(id, {
//     ...data,

//     ...(data.startDate && {
//       startDate: new Date(data.startDate),
//     }),

//     ...(data.endDate && {
//       endDate: new Date(data.endDate),
//     }),
//   });
// };

// export const deleteOffer = async ({
//   id,
//   role,
//   authId,
// }: {
//   id: number;
//   authId: number;
//   role: string;
// }) => {
//   const offer = await offerModel.findOffer({
//     where: { id },
//     select: { sellerId: true },
//   });

//   if (!offer) {
//     throw new HttpError("Offer not found!", 404);
//   }

//   const isAdmin = role === "admin";
//   const isSellerOwner = role === "seller" && offer.sellerId === authId;

//   if (!isAdmin && !isSellerOwner) {
//     throw new HttpError("Permission denied!", 403);
//   }

//   await offerModel.deleteOffer(id);

//   return { message: "Offer deleted successfully" };
// };

// export const getOffer = async (query: { id: number }) => {
//   const offer = await offerModel.findOffer({
//     where: {
//       id: query.id,
//     },
//     include: {
//       products: {
//         include: {
//           product: true,
//         },
//       },

//       variants: {
//         include: {
//           variant: true,
//         },
//       },
//     },
//   });

//   if (!offer) {
//     throw new HttpError("Offer Not found!", 404);
//   }

//   return offer;
// };

// export const getOffers = async (query: {
//   page?: number;
//   limit?: number;
//   search?: string;
//   sellerId?: string | number;
//   sortBy?: string;
//   orderBy?: "asc" | "desc";
//   createdAt?: string | { from?: string; to?: string };
//   startDate?: string | { from?: string; to?: string };
//   endDate?: string | { from?: string; to?: string };
// }) => {
//   const page = query.page ? Number(query.page) : 1;
//   const limit = query.limit ? Number(query.limit) : 10;
//   const skip = (page - 1) * limit;

//   const where: Prisma.OfferWhereInput = {};

//   // Search by name (MySQL safe)
//   if (query.search) {
//     const keyword = query.search.trim();
//     where.OR = [{ name: { contains: keyword } }];
//   }

//   // Seller filter
//   if (query.sellerId) {
//     where.sellerId = Number(query.sellerId);
//   }

//   // Date filter helper
//   const buildDateFilter = (input: any) => {
//     if (typeof input === "string") return { equals: new Date(input) };
//     if (typeof input === "object") {
//       const range: any = {};
//       if (input.from) range.gte = new Date(input.from);
//       if (input.to) range.lte = new Date(input.to);
//       return range;
//     }
//   };

//   if (query.createdAt) where.createdAt = buildDateFilter(query.createdAt);
//   if (query.startDate) where.startDate = buildDateFilter(query.startDate);
//   if (query.endDate) where.endDate = buildDateFilter(query.endDate);

//   // Sorting
//   const orderBy: Prisma.OfferOrderByWithRelationInput[] = [];
//   if (query.sortBy) {
//     const fields = query.sortBy.split(",");
//     const direction = query.orderBy === "asc" ? "asc" : "desc";
//     fields.forEach((field) => orderBy.push({ [field]: direction } as any));
//   } else {
//     orderBy.push({ createdAt: "desc" });
//   }

//   // Total count
//   const total = await offerModel.countOffers({ where });

//   // Fetch offers with products & variants
//   const offers = await offerModel.findOffers({
//     where,
//     skip,
//     take: limit,
//     orderBy,
//   });

//   return {
//     total,
//     page,
//     limit,
//     offers,
//   };
// };
