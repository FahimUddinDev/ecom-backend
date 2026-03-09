import * as yup from "yup";

export const cartSchema = yup.object({
  productId: yup.number().required("Product ID is required"),
  variantId: yup.number().optional(),
  quantity: yup
    .number()
    .min(1, "Quantity must be at least 1")
    .required("Quantity is required"),
});

export const updateCartSchema = yup.object({
  quantity: yup
    .number()
    .min(1, "Quantity must be at least 1")
    .required("Quantity is required"),
});

export const bulkCartSchema = yup.object({
  items: yup
    .array(
      yup.object({
        productId: yup.number().required("Product ID is required"),
        variantId: yup.number().optional(),
        quantity: yup
          .number()
          .min(1, "Quantity must be at least 1")
          .required("Quantity is required"),
      }),
    )
    .min(1, "At least one item is required")
    .required("Items are required"),
});

export const bulkDeleteSchema = yup.object({
  ids: yup
    .array(yup.number().required())
    .min(1, "At least one id is required")
    .required("IDs are required"),
});
