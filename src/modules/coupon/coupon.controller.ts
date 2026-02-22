import { NextFunction, Request, Response } from "express";
import * as couponService from "./coupon.service";

export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      code,
      referralCode,
      description,
      discountType,
      discountValue,
      usageLimit,
      startDate,
      endDate,
      productIds,
      variantIds,
      sellerId,
    } = req.body;

    const { user } = req as Request & {
      user: { data: { id: number; role: "admin" | "seller" } };
    };

    //  Unauthorized role
    if (!["admin", "seller"].includes(user.data.role)) {
      return res.status(403).json({
        message: "You don't have permission to create coupon.",
      });
    }

    let finalSellerId: number | undefined;

    if (user.data.role === "seller") {
      if (sellerId && sellerId !== user.data.id) {
        return res.status(403).json({
          message: "Only you can create offers for yourself.",
        });
      }
      finalSellerId = user.data.id;
    }

    if (user.data.role === "admin") {
      finalSellerId = sellerId;
    }

    const coupon = await couponService.createCoupon({
      code,
      referralCode,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      productIds,
      variantIds,
      sellerId: finalSellerId,
      usageLimit,
    });

    return res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      code,
      referralCode,
      description,
      discountType,
      discountValue,
      usageLimit,
      startDate,
      endDate,
      productIds,
      variantIds,
      sellerId,
    } = req.body;

    const updateData = Object.fromEntries(
      Object.entries({
        code,
        referralCode,
        description,
        discountType,
        discountValue,
        usageLimit,
        startDate,
        endDate,
        productIds,
        variantIds,
        sellerId,
      }).filter(([_, value]) => value !== undefined),
    );

    const { user } = req as Request & {
      user: { data: { id: number; role: "admin" | "seller" } };
    };

    const coupon = await couponService.getCoupon({ id: +req.params.id });

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    if (!["admin", "seller"].includes(user.data.role)) {
      return res.status(403).json({
        message: "You don't have permission to update coupon.",
      });
    }

    if (user.data.role === "seller") {
      if (sellerId && Number(sellerId) !== user.data.id) {
        return res.status(403).json({
          message: "Only you can update coupons for yourself.",
        });
      }

      if (coupon.sellerId !== user.data.id) {
        return res.status(403).json({
          message: "You don't own this coupon.",
        });
      }
    }

    if (user.data.role === "admin") {
      updateData.sellerId = sellerId ?? coupon.sellerId;
    }

    const updatedCoupon = await couponService.updateCoupon(
      +req.params.id,
      updateData,
    );

    return res.status(200).json(updatedCoupon);
  } catch (err) {
    next(err);
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    await couponService.deleteCoupon({
      id: +req.params.id,
      role: user.data.role,
      authId: user.data.id,
    });
    res.status(204).json({ message: "Deleted coupon successfully." });
  } catch (err) {
    next(err);
  }
};

export const getCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(422).json({
        message: "Invalid coupon id.",
      });
    }

    const coupon = await couponService.getCoupon({
      id,
    });

    return res.json(coupon);
  } catch (err) {
    next(err);
  }
};

export const getCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, search, sellerId } = await req.query;

    const finalQuery = Object.fromEntries(
      Object.entries({
        page,
        limit,
        search,
        sellerId,
      }).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
    const coupons = await couponService.getCoupons(finalQuery);
    res.status(200).json(coupons);
  } catch (err) {
    next(err);
  }
};

// coupon referral

export const createCouponReferral = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { couponId, ipAddress, userId } = req.body;

    const { user } = req as Request & {
      user: { data: { id: number; role: "admin" | "seller" } };
    };

    //  Unauthorized role
    if (!["admin", "seller"].includes(user.data.role)) {
      return res.status(403).json({
        message: "You don't have permission to create coupon.",
      });
    }

    const coupon = await couponService.createCouponReferral({
      couponId,
      ipAddress,
      userId,
      authId: user.data.id,
      role: user.data.role,
    });

    return res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
};

export const updateCouponReferral = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { couponId, ipAddress, userId } = req.body;

    const updateData = Object.fromEntries(
      Object.entries({
        couponId,
        ipAddress,
        userId,
      }).filter(([_, value]) => value !== undefined),
    );

    const { user } = req as Request & {
      user: { data: { id: number; role: "admin" | "seller" } };
    };

    const couponReferral = await couponService.getCouponReferral({
      id: +req.params.id,
    });

    if (!couponReferral) {
      return res.status(404).json({
        message: "Coupon referral not found",
      });
    }

    if (!["admin", "seller"].includes(user.data.role)) {
      return res.status(403).json({
        message: "You don't have permission to update coupon referral.",
      });
    }

    const updatedCouponReferral = await couponService.updateCouponReferral(
      +req.params.id,
      { ...updateData, role: user.data.role, authId: user.data.id },
    );

    return res.status(200).json(updatedCouponReferral);
  } catch (err) {
    next(err);
  }
};

export const getCouponReferral = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(422).json({
        message: "Invalid coupon referral id.",
      });
    }

    const couponReferral = await couponService.getCouponReferral({
      id,
    });

    return res.json(couponReferral);
  } catch (err) {
    next(err);
  }
};

export const getCouponReferrals = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, search, userId, couponId, ipAddress } =
      await req.query;

    const finalQuery = Object.fromEntries(
      Object.entries({
        page,
        limit,
        userId,
        couponId,
        ipAddress,
      }).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
    const couponReferrals = await couponService.getCouponReferrals(finalQuery);
    res.status(200).json(couponReferrals);
  } catch (err) {
    next(err);
  }
};

export const deleteCouponReferral = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    await couponService.deleteCouponReferral({
      id: +req.params.id,
      role: user.data.role,
      authId: user.data.id,
    });
    res.status(204).json({ message: "Deleted coupon referral successfully." });
  } catch (err) {
    next(err);
  }
};

// coupon usage

export const createCouponUsage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { couponId, ipAddress, userId } = req.body;

    const { user } = req as Request & {
      user: { data: { id: number; role: "admin" | "seller" } };
    };

    //  Unauthorized role
    if (!["admin", "seller"].includes(user.data.role)) {
      return res.status(403).json({
        message: "You don't have permission to create coupon.",
      });
    }

    const coupon = await couponService.createCouponUsage({
      couponId,
      userId,
      authId: user.data.id,
      role: user.data.role,
    });

    return res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
};

export const updateCouponUsage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { couponId, ipAddress, userId } = req.body;

    const updateData = Object.fromEntries(
      Object.entries({
        couponId,
        ipAddress,
        userId,
      }).filter(([_, value]) => value !== undefined),
    );

    const { user } = req as Request & {
      user: { data: { id: number; role: "admin" | "seller" } };
    };

    const couponUsage = await couponService.getCouponUsage({
      id: +req.params.id,
    });

    if (!couponUsage) {
      return res.status(404).json({
        message: "Coupon referral not found",
      });
    }

    if (!["admin", "seller"].includes(user.data.role)) {
      return res.status(403).json({
        message: "You don't have permission to update coupon referral.",
      });
    }

    const updatedCouponUsage = await couponService.updateCouponUsage(
      +req.params.id,
      { ...updateData, role: user.data.role, authId: user.data.id },
    );

    return res.status(200).json(updatedCouponUsage);
  } catch (err) {
    next(err);
  }
};

export const getCouponUsage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(422).json({
        message: "Invalid coupon referral id.",
      });
    }

    const couponUsage = await couponService.getCouponUsage({
      id,
    });

    return res.json(couponUsage);
  } catch (err) {
    next(err);
  }
};

export const getCouponUsages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, search, userId, couponId, ipAddress } =
      await req.query;

    const finalQuery = Object.fromEntries(
      Object.entries({
        page,
        limit,
        userId,
        couponId,
        ipAddress,
      }).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
    const couponUsages = await couponService.getCouponUsages(finalQuery);
    res.status(200).json(couponUsages);
  } catch (err) {
    next(err);
  }
};

export const deleteCouponUsage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    await couponService.deleteCouponUsage({
      id: +req.params.id,
      role: user.data.role,
      authId: user.data.id,
    });
    res.status(204).json({ message: "Deleted coupon usage successfully." });
  } catch (err) {
    next(err);
  }
};
