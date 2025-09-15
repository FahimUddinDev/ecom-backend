// User routes
import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { handleUpload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as categoryController from "./category.controller";
import { categorySchema } from "./category.validator";

const router = Router();

router
  .route("/")
  .get(categoryController.getCategories)
  .post(
    authenticate,
    handleUpload({ thumbnail: 1 }),
    validate({ body: categorySchema }),
    categoryController.createCategory
  );
router
  .route("/:slug")
  .get(categoryController.getCategory)
  .put(
    authenticate,
    handleUpload({ thumbnail: 1 }),
    validate({ body: categorySchema }),
    categoryController.updateCategory
  )
  .delete(authenticate, categoryController.deleteCategory);
export default router;
