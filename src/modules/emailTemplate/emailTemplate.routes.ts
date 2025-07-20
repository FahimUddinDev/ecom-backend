import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import * as emailTemplateController from "./emailTemplate.controller";
import {
  createEmailTemplateSchema,
  updateEmailTemplateSchema,
} from "./emailTemplate.validator";
const router = Router();
router
  .route("/")
  .get(emailTemplateController.findAllEmailTemplates)
  .post(
    validate({ body: createEmailTemplateSchema }),
    emailTemplateController.createEmailTemplate
  );
router
  .route("/:id")
  .get(emailTemplateController.findEmailTemplate)
  .delete(emailTemplateController.deleteEmailTemplate)
  .put(
    validate({ body: updateEmailTemplateSchema }),
    emailTemplateController.updateEmailTemplate
  );
export default router;
