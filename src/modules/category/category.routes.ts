// User routes
import { Router } from "express";

import { handleUpload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as categoryController from "./category.controller";
import { categorySchema } from "./category.validator";

const router = Router();

router
  .route("/")
  // .get(categoryController.getUsers)
  .post(
    handleUpload({ thumbnail: 1 }),
    validate({ body: categorySchema }),
    categoryController.createCategory
  );

export default router;
