// Combine all routes
import { Router } from "express";
import addressRoutes from "../modules/address/address.routes";
import authRouter from "../modules/auth/auth.routes";
import categoriesRoutes from "../modules/category/category.routes";
import childCategoriesRoutes from "../modules/childCategory/childCategory.routes";
import emailTemplateRoutes from "../modules/emailTemplate/emailTemplate.routes";
import smtpRoutes from "../modules/smtp/smtp.routes";
import subCategoriesRoutes from "../modules/subCategory/subCategory.routes";
import userRoutes from "../modules/user/user.routes";
import verificationRoutes from "../modules/verification/verification.routes";

const router = Router();
router.use("/auth", authRouter);
router.use("/users", userRoutes);
router.use("/smtp", smtpRoutes);
router.use("/email-templates", emailTemplateRoutes);
router.use("/verify", verificationRoutes);
router.use("/categories", categoriesRoutes);
router.use("/sub-categories", subCategoriesRoutes);
router.use("/child-categories", childCategoriesRoutes);
router.use("/address", addressRoutes);
// router.use("/products", productsRoutes);

export default router;
