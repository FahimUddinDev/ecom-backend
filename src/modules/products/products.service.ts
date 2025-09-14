// import { Prisma } from "@prisma/client";
// import bcrypt from "bcrypt";
// import { HttpError } from "../../utils/customError";
// import * as userModel from "./user.model";

// export const registerUser = async ({
//   firstName,
//   lastName,
//   email,
//   password,
//   role,
//   avatar,
// }: Prisma.UserCreateInput) => {
//   const existing = await userModel.findUser({ where: { email } });
//   if (existing) throw new HttpError("Email already exist!", 409);
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const user = await userModel.createUser({
//     firstName: firstName.toLowerCase(),
//     lastName: lastName?.toLowerCase(),
//     email,
//     password: hashedPassword,
//     role,
//     status: !role || role === "user" ? "active" : "pending",
//     avatar: avatar ? `/public/${avatar}` : null,
//   });
//   return { ...user, kyc: { status: "false" } };
// };
