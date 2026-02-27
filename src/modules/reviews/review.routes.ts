import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { handleUpload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as reviewController from "./review.controller";
import { reviewSchema } from "./review.validator";

const router = Router();

router
  .route("/")
  // .get(reviewController.getReviews)
  .post(
    authenticate,
    handleUpload({ images: 10 }),
    validate({ body: reviewSchema }),
    reviewController.createReview,
  );

// router
//   .route("/:id")
//   .get(reviewController.getReview)
//   .delete(authenticate, reviewController.deleteReview);

export default router;
