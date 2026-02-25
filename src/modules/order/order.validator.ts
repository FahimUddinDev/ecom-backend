import * as yup from "yup";

export enum PaymentMethod {
  cash_on_delivery = "cash_on_delivery",
  stripe = "stripe",
  sslcommerz = "sslcommerz",
}

export enum OrderStatus {
  pending = "pending",
  processing = "processing",
  shipped = "shipped",
  delivered = "delivered",
  cancelled = "cancelled",
  returned = "returned",
}

export const createOrderSchema = yup.object({
  deliveryAddressId: yup.number().required("Delivery address is required"),
  pickupAddressId: yup.number().required("Pickup address is required"),
  paymentMethod: yup
    .mixed<PaymentMethod>()
    .oneOf(Object.values(PaymentMethod), "Invalid payment method")
    .required("Payment method is required"),
  couponCode: yup.string().optional(),
  notes: yup.string().optional(),
  items: yup
    .array()
    .of(
      yup.object({
        productId: yup.number().required("Product ID is required"),
        variantId: yup.number().optional(),
        quantity: yup.number().required("Quantity is required").min(1),
      }),
    )
    .min(1, "Order must have at least one item")
    .required("Items are required"),
});

export const updateOrderStatusSchema = yup.object({
  status: yup
    .mixed<OrderStatus>()
    .oneOf(Object.values(OrderStatus), "Invalid order status")
    .required("Status is required"),
});
