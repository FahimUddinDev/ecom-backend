import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as blogCategoryController from "./blogCategory.controller"
import { blogCategorySchema } from "./blogCategory.validator";


const router = Router();

router.route("/").post(authenticate, validate({ body: blogCategorySchema }), blogCategoryController.createBlogCategory);
router.route("/").get(blogCategoryController.getBlogCategories);

router
    .route("/:id")
    .put(authenticate, validate({ body: blogCategorySchema }), blogCategoryController.updateBlogCategory)
    .delete(authenticate, blogCategoryController.deleteBlogCategory);

export default router;