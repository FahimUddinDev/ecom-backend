import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as couponController from "./coupon.controller";
import { couponSchema } from "./coupon.validator";

const router = Router();

router
  .route("/")
  // .get(offerController.getOffers)
  .post(
    authenticate,
    validate({ body: couponSchema }),
    couponController.createCoupon,
  );
// router
// .route("/:id")
// .put(
//   authenticate,
//   // validate({ body: offerSchema }),
//   offerController.updateOffer,
// )
// .get(offerController.getOffer)
// .delete(authenticate, offerController.deleteOffer);
export default router;
