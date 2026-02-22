import {
  Coupon,
  CouponReferral,
  CouponUsage,
  Prisma,
  Product,
} from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findProduct = async (
  query: Prisma.ProductFindUniqueArgs,
): Promise<Product | null> => {
  return prisma.product.findUnique(query);
};

export const createCoupon = async (data: {
  code: string;
  referralCode?: string;
  description?: string;
  discountType: Prisma.OfferCreateInput["discountType"];
  discountValue: number;
  usageLimit?: number;
  usedCount?: number;
  startDate: Date;
  endDate?: Date;
  productIds?: number[];
  variantIds?: number[];
  sellerId?: number;
}): Promise<Coupon> => {
  const { productIds = [], variantIds = [], discountValue, ...rest } = data;

  const prismaData: Prisma.CouponCreateInput = {
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

  return prisma.coupon.create({
    data: prismaData,
    include: {
      products: true,
      variants: true,
    },
  });
};

export const updateCoupon = async (
  id: number,
  data: Prisma.CouponUpdateInput & {
    productIds?: number[];
    variantIds?: number[];
  },
): Promise<Coupon> => {
  const { productIds, variantIds, ...rest } = data;

  return prisma.coupon.update({
    where: { id },

    data: {
      ...rest,

      // ===== Product Relation Update =====
      products: productIds
        ? {
            deleteMany: {},
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

export const findCoupon = async (query: Prisma.CouponFindUniqueArgs) => {
  return prisma.coupon.findUnique({
    ...query,
  });
};

export const deleteCoupon = async (id: number): Promise<Coupon> => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // ===== Delete related products =====
    await tx.couponOnProduct.deleteMany({
      where: {
        couponId: id,
      },
    });

    // ===== Delete related variants =====
    await tx.couponOnVariant.deleteMany({
      where: {
        couponId: id,
      },
    });

    // ===== Finally delete offer =====
    return tx.coupon.delete({
      where: { id },
    });
  });
};

export const findCoupons = async (
  query: Prisma.CouponFindManyArgs,
): Promise<Coupon[]> => {
  return prisma.coupon.findMany({
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

export const countCoupons = async (
  query: Prisma.CouponCountArgs,
): Promise<number> => {
  return prisma.coupon.count(query);
};

// coupon refferal
export const createCouponReferral = async (data: {
  couponId: number;
  ipAddress: string;
  userId: number;
}): Promise<CouponReferral> => {
  const { couponId, ipAddress, userId } = data;

  const prismaData: Prisma.CouponReferralCreateInput = {
    coupon: { connect: { id: couponId } },
    ipAddress,
    user: { connect: { id: userId } },
  };

  return prisma.couponReferral.create({
    data: prismaData,
    include: {
      coupon: true,
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

export const updateCouponReferral = async (
  id: number,
  data: Prisma.CouponReferralUpdateInput & {
    couponId?: number;
    ipAddress?: string;
    userId?: number;
  },
): Promise<CouponReferral> => {
  const { couponId, ipAddress, userId } = data;

  return prisma.couponReferral.update({
    where: { id },

    data: {
      coupon: { connect: { id: couponId } },
      ipAddress,
      user: { connect: { id: userId } },
    },

    include: {
      coupon: true,
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

export const findCouponReferral = async (
  query: Prisma.CouponReferralFindUniqueArgs,
) => {
  return prisma.couponReferral.findUnique({
    ...query,
  });
};

export const findCouponReferrals = async (
  query: Prisma.CouponReferralFindManyArgs,
): Promise<CouponReferral[]> => {
  return prisma.couponReferral.findMany({
    ...query,
    include: {
      coupon: true,
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

export const countCouponReferrals = async (
  query: Prisma.CouponReferralCountArgs,
): Promise<number> => {
  return prisma.couponReferral.count(query);
};

export const deleteCouponReferral = async (
  id: number,
): Promise<CouponReferral> => {
  return prisma.couponReferral.delete({
    where: { id },
  });
};

// coupon uses

export const createCouponUsage = async (data: {
  couponId: number;
  userId: number;
}): Promise<CouponUsage> => {
  const { couponId, userId } = data;

  const prismaData: Prisma.CouponUsageCreateInput = {
    coupon: { connect: { id: couponId } },
    user: { connect: { id: userId } },
  };

  return prisma.couponUsage.create({
    data: prismaData,
    include: {
      coupon: true,
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

export const updateCouponUsage = async (
  id: number,
  data: Prisma.CouponUsageUpdateInput & {
    couponId?: number;
    userId?: number;
  },
): Promise<CouponUsage> => {
  const { couponId, userId } = data;

  return prisma.couponUsage.update({
    where: { id },

    data: {
      coupon: { connect: { id: couponId } },
      user: { connect: { id: userId } },
    },

    include: {
      coupon: true,
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

export const findCouponUsage = async (
  query: Prisma.CouponUsageFindUniqueArgs,
) => {
  return prisma.couponUsage.findUnique({
    ...query,
  });
};

export const findCouponUsages = async (
  query: Prisma.CouponUsageFindManyArgs,
): Promise<CouponUsage[]> => {
  return prisma.couponUsage.findMany({
    ...query,
    include: {
      coupon: true,
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

export const countCouponUsages = async (
  query: Prisma.CouponUsageCountArgs,
): Promise<number> => {
  return prisma.couponUsage.count(query);
};

export const deleteCouponUsage = async (id: number): Promise<CouponUsage> => {
  return prisma.couponUsage.delete({
    where: { id },
  });
};
