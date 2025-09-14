// User validator
import * as yup from "yup";

export const categorySchema = yup.object({
  name: yup.string().required("Category name is required").min(3),
  thumbnail: yup.string(),
});
export const SubcategorySchema = yup.object({
  name: yup.string().required("Category name is required").min(3),
  categoryId: yup.number().required("Category Id is required"),
  thumbnail: yup.string(),
});
export const childCategorySchema = yup.object({
  name: yup.string().required("Category name is required").min(3),
  categoryId: yup.string().required("Category Id is required"),
  subCategoryId: yup.string().required("Subcategory id is required"),
  thumbnail: yup.string(),
});
