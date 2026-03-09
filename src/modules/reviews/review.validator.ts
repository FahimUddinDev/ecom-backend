import * as yup from "yup";

export const reviewSchema = yup.object({
  productId: yup.number().required("Product ID is required"),
  userId: yup.number().optional(),
  orderId: yup.number().required("Order ID is required"),
  orderItemId: yup.number().required("Order Item ID is required"),
  rating: yup.number().required("Rating is required"),
  comment: yup.string().required("Comment is required"),
  images: yup.array().optional(),
});
