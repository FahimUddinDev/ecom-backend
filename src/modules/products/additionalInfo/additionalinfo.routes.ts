import { Router } from "express";

import { authenticate } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import * as additionalInfoController from "./additionalinfo.controller";
import {
  additionalInfoSchema,
  bulkAdditionalInfoSchema,
} from "./additionalInfo.validator";

const router = Router();

router
  .route("/")
  .get(additionalInfoController.getAdditionalInfos)
  .post(
    authenticate,
    validate({ body: additionalInfoSchema }),
    additionalInfoController.createAdditionalInfo,
  )
  .patch(
    authenticate,
    validate({ body: bulkAdditionalInfoSchema }),
    additionalInfoController.createAdditionalInfos,
  );
router
  .route("/:id")
  .put(
    authenticate,
    validate({ body: additionalInfoSchema }),
    additionalInfoController.updateAdditionalInfo,
  )
  .get(additionalInfoController.getAdditionalInfo)
  .delete(authenticate, additionalInfoController.deleteAdditionalInfo);
export default router;
