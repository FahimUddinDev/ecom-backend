// User routes
import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as addressController from "./address.controller";
import { addressSchema } from "./address.validator";

const router = Router();

router
  .route("/")
  .get(addressController.getAddresses)
  .post(
    authenticate,
    validate({ body: addressSchema }),
    addressController.createAddress
  );
// router
//   .route("/:slug")
//   .get(addressController.getCategory)
//   .put(
//     authenticate,
//     handleUpload({ thumbnail: 1 }),
//     validate({ body: addressSchema }),
//     addressController.updateCategory
//   )
//   .delete(authenticate, addressController.deleteCategory);
export default router;
