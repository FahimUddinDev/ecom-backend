// Combine all routes
import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import smtpRoutes from "../modules/smtp/smtp.routes";
import userRoutes from "../modules/user/user.routes";

const router = Router();
router.use("/auth", authRouter);
router.use("/users", userRoutes);
router.use("/smtp", smtpRoutes);

export default router;
