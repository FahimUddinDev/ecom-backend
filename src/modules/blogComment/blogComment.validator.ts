import * as yup from "yup";

export const blogCommentUpdateSchema = yup.object({
    content: yup.string().required("Comment is required").min(1),
});

export const blogCommentVisibilitySchema = yup.object({
    isHidden: yup.boolean().required(),
});