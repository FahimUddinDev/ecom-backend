import * as yup from "yup";

export enum DiscountType {
  percentage = "percentage",
  fixed = "fixed",
}

export enum StatusType {
  active = "active",
  inactive = "inactive",
  draft = "draft",
}

export enum OfferType {
  all = "all",
  product = "product",
  variant = "variant",
}

export const offerSchema = yup.object({
  name: yup.string().required("Offer name is required"),
  sellerId: yup.number(),
  offerType: yup
    .mixed<OfferType>()
    .oneOf(Object.values(OfferType), "Invalid offer type")
    .required("offer type is required"),
  discountType: yup
    .mixed<DiscountType>()
    .oneOf(Object.values(DiscountType), "Invalid discount type")
    .required("Discount type is required"),
  status: yup
    .mixed<StatusType>()
    .oneOf(Object.values(StatusType), "Invalid offer type"),
  discountValue: yup
    .number()
    .required("Price is required")
    .min(0, "Price must be at least 0"),
  startDate: yup.date().required("Date is required").typeError("Invalid date"),
  endDate: yup.date().required("Date is required").typeError("Invalid date"),
});
