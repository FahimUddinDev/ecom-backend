import { DiscountType, Prisma } from "@prisma/client";
import { HttpError } from "../../utils/customError";
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

export const updateCoupon = async (
  id: number,
  data: Partial<{
    sellerId?: number;
    code: string;
    referralCode: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    usageLimit: number;
    startDate: string;
    endDate: string;
    productIds?: number[];
    variantIds?: number[];
  }>,
) => {
  const existingCoupon = await couponModel.findCoupon({
    where: { id },
  });

  if (!existingCoupon) throw new Error("Coupon not found");

  return couponModel.updateCoupon(id, {
    ...data,

    ...(data.startDate && {
      startDate: new Date(data.startDate),
    }),

    ...(data.endDate && {
      endDate: new Date(data.endDate),
    }),
  });
};

export const deleteCoupon = async ({
  id,
  role,
  authId,
}: {
  id: number;
  authId: number;
  role: string;
}) => {
  const coupon = await couponModel.findCoupon({
    where: { id },
    select: { sellerId: true },
  });

  if (!coupon) {
    throw new HttpError("Coupon not found!", 404);
  }

  const isAdmin = role === "admin";
  const isSellerOwner = role === "seller" && coupon.sellerId === authId;

  if (!isAdmin && !isSellerOwner) {
    throw new HttpError("Permission denied!", 403);
  }

  await couponModel.deleteCoupon(id);

  return { message: "Coupon deleted successfully" };
};

export const getCoupon = async (query: { id: number }) => {
  const coupon = await couponModel.findCoupon({
    where: {
      id: query.id,
    },
    include: {
      products: {
        include: {
          product: true,
        },
      },

      variants: {
        include: {
          variant: true,
        },
      },
    },
  });

  if (!coupon) {
    throw new HttpError("Coupon Not found!", 404);
  }

  return coupon;
};

export const getCoupons = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  sellerId?: string | number;
  sortBy?: string;
  orderBy?: "asc" | "desc";
  createdAt?: string | { from?: string; to?: string };
  startDate?: string | { from?: string; to?: string };
  endDate?: string | { from?: string; to?: string };
}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const where: Prisma.CouponWhereInput = {};

  // Search by name (MySQL safe)
  if (query.search) {
    const keyword = query.search.trim();
    where.OR = [{ code: { contains: keyword } }];
  }

  // Seller filter
  if (query.sellerId) {
    where.sellerId = Number(query.sellerId);
  }

  // Date filter helper
  const buildDateFilter = (input: any) => {
    if (typeof input === "string") return { equals: new Date(input) };
    if (typeof input === "object") {
      const range: any = {};
      if (input.from) range.gte = new Date(input.from);
      if (input.to) range.lte = new Date(input.to);
      return range;
    }
  };

  if (query.createdAt) where.createdAt = buildDateFilter(query.createdAt);
  if (query.startDate) where.startDate = buildDateFilter(query.startDate);
  if (query.endDate) where.endDate = buildDateFilter(query.endDate);

  // Sorting
  const orderBy: Prisma.CouponOrderByWithRelationInput[] = [];
  if (query.sortBy) {
    const fields = query.sortBy.split(",");
    const direction = query.orderBy === "asc" ? "asc" : "desc";
    fields.forEach((field) => orderBy.push({ [field]: direction } as any));
  } else {
    orderBy.push({ createdAt: "desc" });
  }

  // Total count
  const total = await couponModel.countCoupons({ where });

  // Fetch offers with products & variants
  const coupons = await couponModel.findCoupons({
    where,
    skip,
    take: limit,
    orderBy,
  });

  return {
    total,
    page,
    limit,
    coupons,
  };
};

// coupon referal

export const createCouponReferral = async ({
  couponId,
  ipAddress,
  userId,
  authId,
  role,
}: {
  couponId: number;
  ipAddress: string;
  userId: number;
  authId: number;
  role: string;
}) => {
  const coupon = await couponModel.findCoupon({
    where: { id: couponId },
    select: { sellerId: true },
  });

  if (!coupon) {
    throw new HttpError("Coupon Not found!", 404);
  }

  const isAdmin = role === "admin";
  const isSellerOwner = role === "seller" && coupon.sellerId === authId;

  if (!isAdmin && !isSellerOwner) {
    throw new HttpError("Permission denied!", 403);
  }

  return couponModel.createCouponReferral({
    couponId,
    ipAddress,
    userId,
  });
};

export const updateCouponReferral = async (
  id: number,
  updatedData: Partial<{
    couponId: number;
    ipAddress: string;
    userId: number;
    authId: number;
    role: string;
  }>,
) => {
  const coupon = await couponModel.findCoupon({
    where: { id: updatedData.couponId },
    select: { sellerId: true },
  });

  if (!coupon) {
    throw new HttpError("Coupon Not found!", 404);
  }
  const isAdmin = updatedData.role === "admin";
  const isSellerOwner =
    updatedData.role === "seller" && coupon.sellerId === updatedData.authId;

  if (!isAdmin && !isSellerOwner) {
    throw new HttpError("Permission denied!", 403);
  }

  return couponModel.updateCouponReferral(id, {
    couponId: updatedData.couponId,
    ipAddress: updatedData.ipAddress,
    userId: updatedData.userId,
  });
};

export const deleteCouponReferral = async ({
  id,
  role,
  authId,
}: {
  id: number;
  authId: number;
  role: string;
}) => {
  const couponReferral = await couponModel.findCouponReferral({
    where: { id },
    select: { couponId: true },
  });

  if (!couponReferral) {
    throw new HttpError("Coupon not found!", 404);
  }

  const coupon = await couponModel.findCoupon({
    where: { id: couponReferral.couponId },
    select: { sellerId: true },
  });

  if (!coupon) {
    throw new HttpError("Coupon Not found!", 404);
  }

  const isAdmin = role === "admin";
  const isSellerOwner = role === "seller" && coupon.sellerId === authId;

  if (!isAdmin && !isSellerOwner) {
    throw new HttpError("Permission denied!", 403);
  }

  await couponModel.deleteCouponReferral(id);

  return { message: "Coupon deleted successfully" };
};

export const getCouponReferral = async (query: { id: number }) => {
  const couponReferral = await couponModel.findCouponReferral({
    where: {
      id: query.id,
    },
  });

  if (!couponReferral) {
    throw new HttpError("Coupon referral not found!", 404);
  }

  return couponReferral;
};

export const getCouponReferrals = async (query: {
  page?: number;
  limit?: number;
  userId?: number;
  couponId?: number;
  ipAddress?: string;
}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const where: Prisma.CouponReferralWhereInput = {};

  if (query.userId) {
    where.userId = Number(query.userId);
  }

  if (query.couponId) {
    where.couponId = Number(query.couponId);
  }

  if (query.ipAddress) {
    where.ipAddress = query.ipAddress;
  }

  // Total count
  const total = await couponModel.countCouponReferrals({ where });

  const couponReferrals = await couponModel.findCouponReferrals({
    where,
    skip,
    take: limit,
  });

  return {
    total,
    page,
    limit,
    couponReferrals,
  };
};

// coupon uses

export const createCouponUsage = async ({
  couponId,
  userId,
  authId,
  role,
}: {
  couponId: number;
  userId: number;
  authId: number;
  role: string;
}) => {
  const coupon = await couponModel.findCoupon({
    where: { id: couponId },
    select: { sellerId: true },
  });

  if (!coupon) {
    throw new HttpError("Coupon Not found!", 404);
  }

  const isAdmin = role === "admin";
  const isSellerOwner = role === "seller" && coupon.sellerId === authId;

  if (!isAdmin && !isSellerOwner) {
    throw new HttpError("Permission denied!", 403);
  }

  return couponModel.createCouponUsage({
    couponId,
    userId,
  });
};

export const updateCouponUsage = async (
  id: number,
  updatedData: Partial<{
    couponId: number;
    userId: number;
    authId: number;
    role: string;
  }>,
) => {
  const coupon = await couponModel.findCoupon({
    where: { id: updatedData.couponId },
    select: { sellerId: true },
  });

  if (!coupon) {
    throw new HttpError("Coupon Not found!", 404);
  }

  const isAdmin = updatedData.role === "admin";
  const isSellerOwner =
    updatedData.role === "seller" && coupon.sellerId === updatedData.authId;

  if (!isAdmin && !isSellerOwner) {
    throw new HttpError("Permission denied!", 403);
  }

  return couponModel.updateCouponUsage(id, {
    couponId: updatedData.couponId,
    userId: updatedData.userId,
  });
};

export const deleteCouponUsage = async ({
  id,
  role,
  authId,
}: {
  id: number;
  authId: number;
  role: string;
}) => {
  const couponUsage = await couponModel.findCouponUsage({
    where: { id },
    select: { couponId: true },
  });

  if (!couponUsage) {
    throw new HttpError("Coupon not found!", 404);
  }

  const coupon = await couponModel.findCoupon({
    where: { id: couponUsage.couponId },
    select: { sellerId: true },
  });

  if (!coupon) {
    throw new HttpError("Coupon Not found!", 404);
  }

  const isAdmin = role === "admin";
  const isSellerOwner = role === "seller" && coupon.sellerId === authId;

  if (!isAdmin && !isSellerOwner) {
    throw new HttpError("Permission denied!", 403);
  }

  await couponModel.deleteCouponUsage(id);

  return { message: "Coupon deleted successfully" };
};

export const getCouponUsage = async (query: { id: number }) => {
  const couponUsage = await couponModel.findCouponUsage({
    where: {
      id: query.id,
    },
  });

  if (!couponUsage) {
    throw new HttpError("Coupon usage not found!", 404);
  }

  return couponUsage;
};

export const getCouponUsages = async (query: {
  page?: number;
  limit?: number;
  userId?: number;
  couponId?: number;
}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const where: Prisma.CouponUsageWhereInput = {};

  if (query.userId) {
    where.userId = Number(query.userId);
  }

  if (query.couponId) {
    where.couponId = Number(query.couponId);
  }
  // Total count
  const total = await couponModel.countCouponUsages({ where });

  const couponUsages = await couponModel.findCouponUsages({
    where,
    skip,
    take: limit,
  });

  return {
    total,
    page,
    limit,
    couponUsages,
  };
};
