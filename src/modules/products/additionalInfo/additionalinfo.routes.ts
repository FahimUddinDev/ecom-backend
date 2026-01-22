import { Router } from "express";

import { authenticate } from "../../../middlewares/auth.middleware";
import { handleUpload } from "../../../middlewares/multer.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import * as additionalInfoController from "./additionalinfo.controller";
import { additionalInfoSchema } from "./additionalInfo.validator";

const router = Router();

router
  .route("/")
  .get(additionalInfoController.getAdditionalInfos)
  .post(
    authenticate,
    validate({ body: additionalInfoSchema }),
    additionalInfoController.createAdditionalInfo,
  );
router
  .route("/:id")
  .put(
    authenticate,
    handleUpload({ images: 10, thumbnail: 1 }),
    validate({ body: additionalInfoSchema }),
    additionalInfoController.updateAdditionalInfo,
  )
  .get(additionalInfoController.getAdditionalInfo)
  .delete(authenticate, additionalInfoController.deleteAdditionalInfo);
export default router;
