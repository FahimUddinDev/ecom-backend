// User routes
import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { handleUpload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as childCategoryController from "./childCategory.controller";
import {
  childCategorySchema,
  childCategoryUpdateSchema,
} from "./childCategory.validator";

const router = Router();

router
  .route("/")
  .get(childCategoryController.getChildCategories)
  .post(
    authenticate,
    handleUpload({ thumbnail: 1 }),
    validate({ body: childCategorySchema }),
    childCategoryController.createChildCategory
  );
router
  .route("/:slug")
  .get(childCategoryController.getChildCategory)
  .put(
    authenticate,
    handleUpload({ thumbnail: 1 }),
    validate({ body: childCategoryUpdateSchema }),
    childCategoryController.updateChildCategory
  )
  .delete(authenticate, childCategoryController.deleteChildCategory);
export default router;
