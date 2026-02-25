import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as orderController from "./order.controller";
import { createOrderSchema, updateOrderStatusSchema } from "./order.validator";

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

export default router;
