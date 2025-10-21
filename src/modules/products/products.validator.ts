import * as yup from "yup";
export const productSchema = yup.object({
  sellerId: yup.number(),
  name: yup.string().required("Product name is required"),
  ShortDescription: yup.string().required("Short description is required"),
  description: yup.string().required("Description is required"),
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
  categoryId: yup.number().required("Category ID is required"),
  subCategoryId: yup.number().required("Sub-category ID is required"),
  childCategoryId: yup.number().optional(),
  hasVariants: yup.boolean().required("Has variants is required"),
  images: yup.array().of(yup.string()),
  thumbnail: yup.string(),
  tags: yup
    .array()
    .of(yup.string().max(100, "Tag must be at most 100 characters long")),
});
