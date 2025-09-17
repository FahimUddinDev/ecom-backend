// User validator
import * as yup from "yup";

export const subCategorySchema = yup.object({
  name: yup.string().required("Category name is required").min(3),
  categoryId: yup.number().required("Category Id is required"),
  thumbnail: yup.string(),
});
export const subCategoryUpdateSchema = yup.object({
  name: yup.string().required("Category name is required").min(3),
  thumbnail: yup.string(),
});
