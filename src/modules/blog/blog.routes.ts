import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { handleUpload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as blogController from "./blog.controller";
import {
    blogCommentCreateSchema,
    blogCreateSchema,
    blogStatusSchema,
    blogUpdateSchema,
} from "./blog.validator";

const router = Router();

// public
router.route("/").get(blogController.getBlogs);
router.route("/:slug").get(blogController.getBlogBySlug);
router.route("/:slug/comments")
    .get(blogController.getBlogComments)
    .post(authenticate, validate({ body: blogCommentCreateSchema }), blogController.createBlogComment);

// admin
router
    .route("/")
    .post(
        authenticate,
        handleUpload({ thumbnail: 1 }),
        validate({ body: blogCreateSchema }),
        blogController.createBlog
    );

router
    .route("/:id")
    .put(
        authenticate,
        handleUpload({ thumbnail: 1 }),
        validate({ body: blogUpdateSchema }),
        blogController.updateBlog
    )
    .delete(authenticate, blogController.deleteBlog);

router
    .route("/:id/status")
    .patch(authenticate, validate({ body: blogStatusSchema }), blogController.setBlogStatus);

export default router;