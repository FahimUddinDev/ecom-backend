import * as yup from "yup";

export const VerificationSchema = yup.object({
  userId: yup.number().required("User id is required!"),
});

const SUPPORTED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

export const KycSchema = yup.object({
  title: yup.string().required("Title is required"),
  document: yup
    .string()
    .required("Document is required")
    .test("fileFormat", "Unsupported file format", (value) => {
      if (!value) return false;
      const extension = value.split(".").pop()?.toLowerCase();
      return extension ? SUPPORTED_EXTENSIONS.includes(extension) : false;
    }),
});
