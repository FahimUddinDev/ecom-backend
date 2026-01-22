import * as yup from "yup";
export const additionalInfoSchema = yup.object({
  productId: yup.number().required("Product id is required"),
  name: yup.string().required("Product name is required"),
  value: yup.string().required(),
});

export const bulkAdditionalInfoSchema = yup.object({
  productId: yup.number().required("Product id is required"),

  additionalInfos: yup
    .array()
    .of(
      yup.object({
        name: yup.string().required("AdditionalInfo name is required"),
        value: yup.string().required("AdditionalInfo value is required"),
      }),
    )
    .min(1, "At least one additionalInfo is required")
    .required("additionalInfos is required"),
});
