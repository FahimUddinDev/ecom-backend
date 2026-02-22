import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as couponController from "./coupon.controller";
import {
  couponReferralSchema,
  couponSchema,
  couponUsageSchema,
} from "./coupon.validator";

const router = Router();

router
  .route("/")
  .get(couponController.getCoupons)
  .post(
    authenticate,
    validate({ body: couponSchema }),
    couponController.createCoupon,
  );

// coupon refferal
router
  .route("/referral")
  .get(couponController.getCouponReferrals)
  .post(
    authenticate,
    validate({ body: couponReferralSchema }),
    couponController.createCouponReferral,
  );

router
  .route("/referral/:id")
  .get(couponController.getCouponReferral)
  .put(authenticate, couponController.updateCouponReferral)
  .delete(authenticate, couponController.deleteCouponReferral);

// coupon usage
router
  .route("/usage")
  .get(couponController.getCouponUsages)
  .post(
    authenticate,
    validate({ body: couponUsageSchema }),
    couponController.createCouponUsage,
  );

router
  .route("/usage/:id")
  .get(couponController.getCouponUsage)
  .put(authenticate, couponController.updateCouponUsage)
  .delete(authenticate, couponController.deleteCouponUsage);

router
  .route("/:id")
  .put(
    authenticate,
    // validate({ body: offerSchema }),
    couponController.updateCoupon,
  )
  .get(couponController.getCoupon)
  .delete(authenticate, couponController.deleteCoupon);

export default router;
