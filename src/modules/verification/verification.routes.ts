import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { handleUpload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as verificationController from "./verification.controller";
import { KycSchema, VerificationSchema } from "./verification.validator";
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
router
  .route("/kyc")
  .post(
    authenticate,
    handleUpload({ document: 1 }),
    validate({ body: KycSchema }),
    verificationController.createKyc
  )
  .get(authenticate, verificationController.getKycs);
router.route("/kyc/:id").get(authenticate, verificationController.getKyc);
export default router;
