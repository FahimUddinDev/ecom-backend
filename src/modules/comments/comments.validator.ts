import * as yup from "yup";

export const commentSchema = yup.object({
  productId: yup.number().required("Product ID is required"),
  content: yup.string().required("Content is required"),
  parentId: yup.number().optional().nullable(),
  images: yup
    .array()
    .of(yup.string())
    .max(5, "Maximum 5 images allowed")
    .optional(),
});
