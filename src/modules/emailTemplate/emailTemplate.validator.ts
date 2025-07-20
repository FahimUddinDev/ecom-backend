import * as yup from "yup";

export const createEmailTemplateSchema = yup.object({
  name: yup.string().required("Name is required!"),
  subject: yup.string().required("Subject is required!"),
  body: yup.string().required("Body is required!"),
});

export const updateEmailTemplateSchema = yup.object({
  name: yup.string().optional(),
  subject: yup.string().optional(),
  body: yup.string().optional(),
});
export type CreateEmailTemplateInput = yup.InferType<
  typeof createEmailTemplateSchema
>;
export type UpdateEmailTemplateInput = yup.InferType<
  typeof updateEmailTemplateSchema
>;
