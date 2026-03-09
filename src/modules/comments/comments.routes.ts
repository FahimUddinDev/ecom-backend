import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { handleUpload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as commentsController from "./comments.controller";
import { commentSchema } from "./comments.validator";

const router = Router();

// Middleware to conditionally authenticate for creating comments (allow anonymous)
const optionalAuthenticate = (req: any, res: any, next: any) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
};

router
  .route("/")
  .get(commentsController.getComments)
  .post(
    optionalAuthenticate,
    handleUpload({ images: 5 }),
    validate({ body: commentSchema }),
    commentsController.createComment,
  );

router
  .route("/:id")
  .get(commentsController.getComment)
  .patch(
    authenticate,
    handleUpload({ images: 5 }),
    validate({ body: commentSchema.partial() }),
    commentsController.updateComment,
  )
  .delete(authenticate, commentsController.deleteComment);

router
  .route("/:id/reply")
  .post(
    authenticate,
    handleUpload({ images: 5 }),
    validate({ body: commentSchema.omit(["productId", "parentId"]) }),
    commentsController.createReply,
  );

export default router;
