import * as yup from "yup";

export const createSmtpSchema = yup.object({
  host: yup.string().required("Email is required!"),
  password: yup.string().min(6).required("Password is required!"),
  encryption: yup.string().required("Encryption is required!"),
  port: yup.number().required("Port is required!"),
  userName: yup.string().required("Username is required!"),
});
export const updateSmtpSchema = yup.object({
  host: yup.string().optional(),
  password: yup.string().min(6).optional(),
  encryption: yup.string().optional(),
  port: yup.number().optional(),
  userName: yup.string().optional(),
});
export type CreateSmtpInput = yup.InferType<typeof createSmtpSchema>;
export type UpdateSmtpInput = yup.InferType<typeof updateSmtpSchema>;
