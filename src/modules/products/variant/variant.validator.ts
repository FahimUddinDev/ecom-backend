import * as yup from "yup";
export const variantSchema = yup.object({
  productId: yup.number().required("Product id is required"),
  price: yup
    .number()
    .required("Price is required")
    .min(0, "Price must be at least 0"),

  currency: yup.string().required("Currency is required"),
  sku: yup.string().required("SKU is required"),
  stockQuantity: yup
    .number()
    .required("Stock quantity is required")
    .min(0, "Stock quantity must be at least 0"),
  name: yup.string().required("Product name is required"),
  images: yup.array().of(yup.string()),
  thumbnail: yup.string(),
  type: yup.string().required(),
});
