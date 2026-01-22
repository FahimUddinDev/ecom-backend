import * as yup from "yup";
export const additionalInfoSchema = yup.object({
  productId: yup.number().required("Product id is required"),
  name: yup.string().required("Product name is required"),
  value: yup.string().required(),
});
