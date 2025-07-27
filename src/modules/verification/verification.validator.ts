import * as yup from "yup";

export const VerificationSchema = yup.object({
  userId: yup.number().required("User id is required!"),
});
