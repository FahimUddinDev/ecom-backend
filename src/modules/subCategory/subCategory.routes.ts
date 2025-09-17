// User routes
import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { handleUpload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as subCategoryController from "./subCategory.controller";
import {
  subCategorySchema,
  subCategoryUpdateSchema,
} from "./subCategory.validator";

const router = Router();

router
  .route("/")
  .get(subCategoryController.getSubCategories)
  .post(
    authenticate,
    handleUpload({ thumbnail: 1 }),
    validate({ body: subCategorySchema }),
    subCategoryController.createSubCategory
  );
router
  .route("/:slug")
  .get(subCategoryController.getSubCategory)
  .put(
    authenticate,
    handleUpload({ thumbnail: 1 }),
    validate({ body: subCategoryUpdateSchema }),
    subCategoryController.updateSubCategory
  )
  .delete(authenticate, subCategoryController.deleteSubCategory);
export default router;
