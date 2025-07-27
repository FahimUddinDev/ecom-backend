import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as authController from "./auth.controller";
import { loginSchema } from "./auth.validator";
const router = Router();
router
  .route("/")
  .post(validate({ body: loginSchema }), authController.loginController);
router.route("/google").post(authController.googleLoginController);
router.route("/reset").post(authenticate, authController.resetPassword);
export default router;
