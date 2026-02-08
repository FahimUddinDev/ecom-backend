import * as yup from "yup";

export const blogCategorySchema = yup.object({
    name: yup.string().required('Category Name is Required').min(3),
    slug: yup.string().optional(),
    status: yup.string().oneOf(["active", "inactive", "draft"]).optional()
})