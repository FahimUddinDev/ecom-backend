import * as yup from "yup";

export const wishlistSchema = yup.object({
  productId: yup.number().required("Product ID is required"),
});
