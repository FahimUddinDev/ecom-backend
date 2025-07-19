import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import * as smtpController from "./smtp.controller";
import { createSmtpSchema, updateSmtpSchema } from "./smtp.validator";
const router = Router();
router
  .route("/")
  .get(smtpController.findAllSmtpController)
  .post(
    validate({ body: createSmtpSchema }),
    smtpController.createSmtpController
  );
router
  .route("/:id")
  .get(smtpController.findSmtpController)
  .delete(smtpController.deleteSmtpController)
  .put(
    validate({ body: updateSmtpSchema }),
    smtpController.updateSmtpController
  );
export default router;
