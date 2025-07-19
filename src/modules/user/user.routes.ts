// User routes
import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { handleUpload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as userController from "./user.controller";
import { userRegisterSchema, userUpdateSchema } from "./user.validator";

const router = Router();

router
  .route("/")
  .get(userController.getUsers)
  .post(
    handleUpload({ avatar: 1 }),
    validate({ body: userRegisterSchema }),
    userController.register
  );
router
  .route("/:id")
  .get(userController.getUser)
  .put(
    authenticate,
    handleUpload({ avatar: 1 }),
    validate({ body: userUpdateSchema }),
    userController.updateUser
  )
  .delete(authenticate, userController.deleteUser);

export default router;
