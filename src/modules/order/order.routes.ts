import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { handleUpload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as orderController from "./order.controller";

import {
  cancelOrderSchema,
  createOrderSchema,
  returnOrderSchema,
  updateOrderStatusSchema,
  updateReturnStatusSchema,
} from "./order.validator";

const router = Router();

router.use(authenticate);

router
  .route("/")
  .get(orderController.getOrders)
  .post(validate({ body: createOrderSchema }), orderController.createOrder);

router
  .route("/:id")
  .get(orderController.getOrder)
  .patch(
    validate({ body: updateOrderStatusSchema }),
    orderController.updateOrderStatus,
  );

router.post(
  "/:id/cancel",
  validate({ body: cancelOrderSchema }),
  orderController.cancelOrder,
);

router.post(
  "/:id/return",
  handleUpload({ images: 10 }),
  validate({ body: returnOrderSchema }),
  orderController.returnOrder,
);

router.get("/returns/all", orderController.getReturnOrders);

router.patch(
  "/returns/:id/status",
  validate({ body: updateReturnStatusSchema }),
  orderController.updateReturnStatus,
);
router.patch(
  "/items/:id/status",
  validate({ body: updateOrderStatusSchema }),
  orderController.updateOrderItemStatus,
);

export default router;
