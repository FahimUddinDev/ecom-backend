// // User controller
// import { NextFunction, Request, Response } from "express";
// import { User } from "../../../types/usersType";
// import * as userService from "./user.service";

// export const createProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {

//     model Product {
//       sellerId
//       ShortDescription
//       description
//       price
//       currency
//       sku
//       stockQuantity
//       categoryId
//       subCategoryId
//       childCategoryId
//       status
//       images
//       tags
//       variants

//     }

//     model AdditionalInfo {
//       productId
//       name
//       value
//     }
//     const { firstName, lastName, email, password, role, avatar }: User =
//       req.body;
//     const user = await userService.registerUser({
//       firstName,
//       lastName,
//       email,
//       password,
//       role,
//       avatar,
//     });

//     res.status(201).json(user);
//   } catch (err) {
//     next(err);
//   }
// };
