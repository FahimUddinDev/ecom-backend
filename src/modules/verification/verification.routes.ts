import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import * as verificationController from "./verification.controller";
import { VerificationSchema } from "./verification.validator";
const router = Router();
router
  .route("/")
  .put(verificationController.getVerify)
  .post(
    validate({ body: VerificationSchema }),
    verificationController.createVerification
  );
router
  .route("/forgot-password")
  .post(
    validate({ body: VerificationSchema }),
    verificationController.forgotPasswordVerify
  );
export default router;
