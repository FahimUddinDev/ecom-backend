import * as yup from "yup";

export const offerSchema = yup.object({
  productId: yup.number().required("Offer id is required"),
  offerId: yup.number().required("Offer id is required"),
});
