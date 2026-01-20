// Products routes
import { Router } from "express";

import { authenticate } from "../../../middlewares/auth.middleware";
import { handleUpload } from "../../../middlewares/multer.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import * as variantController from "./variant.controller";
import { variantSchema } from "./variant.validator";

const router = Router();

router
  .route("/")
  //   .get(productsController.getProducts)
  .post(
    authenticate,
    handleUpload({ images: 10, thumbnail: 1 }),
    validate({ body: variantSchema }),
    variantController.createVariant,
  );
// router
//   .route("/:id")
//   .put(
//     authenticate,
//     handleUpload({ images: 10, thumbnail: 1 }),
// validate({ body: productSchema }),
//     productsController.updateProduct,
//   )
//   .get(productsController.getProduct)
//   .delete(authenticate, productsController.deleteProduct);
export default router;
