import * as yup from "yup";

export enum DiscountType {
  percentage = "percentage",
  fixed = "fixed",
}

export const couponSchema = yup.object({
  code: yup.string().required("Code is required"),
  referralCode: yup.string(),
  description: yup.string(),
  discountType: yup
    .mixed<DiscountType>()
    .oneOf(Object.values(DiscountType), "Invalid discount type")
    .required("Discount type is required"),
  discountValue: yup
    .number()
    .required("Price is required")
    .min(0, "Price must be at least 0"),
  usageLimit: yup.number().default(1),
  startDate: yup.date().required("Date is required").typeError("Invalid date"),
  endDate: yup.date().required("Date is required").typeError("Invalid date"),
  productIds: yup.array().of(yup.number()),
  variantIds: yup.array().of(yup.number()),
  sellerId: yup.number(),
});

export const couponReferralSchema = yup.object({
  couponId: yup.string().required("Coupon ID is required"),
  ipAddress: yup.string().optional(),
  userId: yup.number().optional(),
});

export const couponUsageSchema = yup.object({
  couponId: yup.number().required("coupon id is required"),
  userId: yup.number().required("user id is required"),
});
