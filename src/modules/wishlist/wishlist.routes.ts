import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as wishlistController from "./wishlist.controller";
import { wishlistSchema } from "./wishlist.validator";

const router = Router();

router
  .route("/")
  .get(wishlistController.getWishlists)
  .post(
    authenticate,
    validate({ body: wishlistSchema }),
    wishlistController.createWishlist,
  );

router
  .route("/:id")
  .get(wishlistController.getWishlist)
  .delete(authenticate, wishlistController.deleteWishlist);

export default router;
