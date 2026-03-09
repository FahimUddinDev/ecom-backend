import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as offerController from "./offer.controller";
import { offerSchema } from "./offer.validator";

const router = Router();

router
  .route("/")
  .get(offerController.getOffers)
  .post(
    authenticate,
    validate({ body: offerSchema }),
    offerController.createOffer,
  );
router
  .route("/:id")
  .put(
    authenticate,
    // validate({ body: offerSchema }),
    offerController.updateOffer,
  )
  .get(offerController.getOffer)
  .delete(authenticate, offerController.deleteOffer);
export default router;
