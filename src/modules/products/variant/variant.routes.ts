// // User routes
// import { Router } from "express";

// import { handleUpload } from "../../middlewares/multer.middleware";
// import { validate } from "../../middlewares/validate.middleware";
// import * as productsController from "./products.controller";
// import { productsRegisterSchema } from "./products.validator";

// const router = Router();

// router
//   .route("/")
//   .get(productsController.getUsers)
//   .post(
//     handleUpload({ avatar: 1 }),
//     validate({ body: productsRegisterSchema }),
//     productsController.register
//   );

// export default router;
