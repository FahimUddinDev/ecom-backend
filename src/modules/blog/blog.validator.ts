import * as yup from "yup";

export const blogCreateSchema = yup.object({
    thumbnail: yup.string().required("Thumbnail is required"),
    title: yup.string().required("Title is required").min(3),
    description: yup.string().required("Description is required").min(10),
    categoryId: yup.number().required("Category is required"),
    slug: yup.string().optional(),
    seoTitle: yup.string().optional(),
    seoDescription: yup.string().optional(),
    status: yup.string().oneOf(["active", "inactive", "draft"]).optional(),
});

export const blogUpdateSchema = yup.object({
    thumbnail: yup.string().optional(),
    title: yup.string().optional().min(3),
    description: yup.string().optional().min(10),
    categoryId: yup.number().optional(),
    slug: yup.string().optional(),
    seoTitle: yup.string().optional(),
    seoDescription: yup.string().optional(),
    status: yup.string().oneOf(["active", "inactive", "draft"]).optional(),
});

export const blogStatusSchema = yup.object({
    status: yup.string().oneOf(["active", "inactive", "draft"]).required(),
});

export const blogCommentCreateSchema = yup.object({
    content: yup.string().required("Comment is required").min(1),
    parentId: yup.number().optional().nullable(),
});