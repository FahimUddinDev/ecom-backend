// Products routes
import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { handleUpload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as productsController from "./products.controller";
import { productSchema } from "./products.validator";

const router = Router();

router
  .route("/")
  .get(productsController.getProducts)
  .post(
    authenticate,
    handleUpload({ images: 10, thumbnail: 1 }),
    validate({ body: productSchema }),
    productsController.createProduct
  );

export default router;
