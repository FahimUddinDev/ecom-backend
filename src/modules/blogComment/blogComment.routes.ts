import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as blogCommentController from "./blogComment.controller";
import { blogCommentUpdateSchema, blogCommentVisibilitySchema } from "./blogComment.validator";

const router = Router();

router.route("/admin")
    .get(authenticate, blogCommentController.listAdmin);

router.route("/:id")
    .put(authenticate, validate({ body: blogCommentUpdateSchema }), blogCommentController.updateMyComment)
    .delete(authenticate, blogCommentController.deleteComment);

router.route("/:id/visibility")
    .patch(authenticate, validate({ body: blogCommentVisibilitySchema }), blogCommentController.setVisibility);

export default router;