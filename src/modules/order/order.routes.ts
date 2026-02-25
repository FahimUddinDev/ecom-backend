import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as orderController from "./order.controller";
import {
  cancelOrderSchema,
  createOrderSchema,
  returnOrderSchema,
  updateOrderStatusSchema,
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
  validate({ body: returnOrderSchema }),
  orderController.returnOrder,
);

export default router;
