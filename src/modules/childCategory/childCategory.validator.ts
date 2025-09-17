// User validator
import * as yup from "yup";

export const childCategorySchema = yup.object({
  name: yup.string().required("Category name is required").min(3),
  subCategoryId: yup.number().required("Sub Category Id is required"),
  thumbnail: yup.string(),
});
export const childCategoryUpdateSchema = yup.object({
  name: yup.string().required("Category name is required").min(3),
  thumbnail: yup.string(),
});
