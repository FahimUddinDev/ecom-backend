// User validator
import * as yup from "yup";

export const userRegisterSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email().required("Email is required"),
  password: yup.string().min(6).required("Password is required"),
  role: yup.string().oneOf(["user", "admin", "seller"]).optional(),
  status: yup.boolean().optional(),
  verified: yup.boolean().optional(),
});

export const userUpdateSchema = yup.object({
  firstName: yup.string().optional(),
  lastName: yup.string().optional(),
  role: yup.string().oneOf(["user", "admin", "seller"]).optional(),
  status: yup.boolean().optional(),
  verified: yup.boolean().optional(),
  kyc: yup.boolean().optional(),
  avatar: yup.string().optional(),
  password: yup.string().optional(),
});
export type UserRegisterInput = yup.InferType<typeof userRegisterSchema>;
