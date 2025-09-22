// address validator
import * as yup from "yup";
export const addressSchema = yup.object({
  street: yup
    .string()
    .required("Street is required")
    .min(5, "Street must be at least 5 characters long"),
  city: yup
    .string()
    .required("City is required")
    .min(2, "City must be at least 2 characters long"),
  state: yup
    .string()
    .required("State is required")
    .min(2, "State must be at least 2 characters long"),
  country: yup
    .string()
    .required("Country is required")
    .min(3, "Country must be at least 3 characters long"),
  addressLine: yup
    .string()
    .required("Address is required")
    .min(3, "Address must be at least 3 characters long"),
  postalCode: yup
    .string()
    .optional()
    .matches(
      /^[A-Za-z0-9\s-]+$/,
      "Postal code can contain letters, numbers, spaces, and hyphens"
    ),
  latitude: yup
    .number()
    .optional()
    .test(
      "is-valid-latitude",
      "Latitude must be between -90 and 90",
      (value) => {
        if (value === undefined || value === null) return true;
        return value >= -90 && value <= 90;
      }
    ),
  longitude: yup
    .number()
    .optional()
    .test(
      "is-valid-longitude",
      "Longitude must be between -180 and 180",
      (value) => {
        if (value === undefined || value === null) return true;
        return value >= -180 && value <= 180;
      }
    ),
});
