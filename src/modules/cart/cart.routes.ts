import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as cartController from "./cart.controller";
import {
  bulkCartSchema,
  bulkDeleteSchema,
  cartSchema,
  updateCartSchema,
} from "./cart.validator";

const router = Router();

router
  .route("/")
  .get(cartController.getCartItems)
  .post(authenticate, validate({ body: cartSchema }), cartController.addToCart);

// Bulk add multiple items at once
router.post(
  "/bulk",
  authenticate,
  validate({ body: bulkCartSchema }),
  cartController.addManyCarts,
);

// Bulk delete by array of ids
router.delete(
  "/bulk",
  authenticate,
  validate({ body: bulkDeleteSchema }),
  cartController.deleteCartItems,
);

// Clear all items for the authenticated user
router.delete("/clear", authenticate, cartController.clearCart);

router
  .route("/:id")
  .get(cartController.getCartItem)
  .patch(
    authenticate,
    validate({ body: updateCartSchema }),
    cartController.updateCartItem,
  )
  .delete(authenticate, cartController.deleteCartItem);

export default router;
