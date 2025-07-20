// Combine all routes
import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import emailTemplateRoutes from "../modules/emailTemplate/emailTemplate.routes";
import smtpRoutes from "../modules/smtp/smtp.routes";
import userRoutes from "../modules/user/user.routes";

const router = Router();
router.use("/auth", authRouter);
router.use("/users", userRoutes);
router.use("/smtp", smtpRoutes);
router.use("/email-templates", emailTemplateRoutes);

export default router;
