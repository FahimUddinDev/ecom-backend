import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { GooglePayload } from "../../../types/usersType";
import { HttpError } from "../../utils/customError";
import { sendPasswordMail } from "../../utils/sendMail";
import * as authModel from "./auth.model";

export const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
  role,
  avatar,
  verified,
}: Prisma.UserCreateInput) => {
  const pic = avatar
    ? avatar?.includes("http")
      ? avatar
      : `/public/${avatar}`
    : null;
  const existing = await authModel.findUser(email);
  if (existing) throw new HttpError("Email already exist!", 409);
  const hashedPassword = await bcrypt.hash(password, 10);
  return authModel.createUser({
    firstName: firstName.toLowerCase(),
    lastName: lastName?.toLowerCase(),
    email,
    password: hashedPassword,
    role,
    status: !role || role === "user" ? "active" : "pending",
    avatar: pic,
    verified: verified ?? false,
  });
};

export const loginUser = async ({
  email,
  password,
  isRemember,
}: {
  email: string;
  password: string;
  isRemember: boolean;
}) => {
  const user = await authModel.findUser(email);
  if (!user) {
    throw new HttpError("Email or password is wrong!", 404);
  }
  if (user.status !== "active") {
    throw new HttpError("Your are not eligible.", 403);
  }
  if (!user.verified) {
    throw new HttpError("Your account is not verified.", 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new HttpError("Email or password is wrong!", 401);
  }
  const exp = isRemember
    ? Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    : Math.floor(Date.now() / 1000) + 60 * 60;
  const token = await jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    },
    process.env.JWT_SECRET || "eyJmb28iOiJiYXIifQ"
  );
  return {
    token,
    id: user?.id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    createdAt: user?.createdAt,
    role: user?.role,
    avatar: user?.avatar,
    kyc: user?.kyc,
  };
};

export const verifyGoogleToken = async (token: string) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

export const googleLoginUser = async (payload: GooglePayload) => {
  if (!payload.email || !payload.given_name) {
    throw new HttpError("Invalid payload!", 400);
  }
  let user = await authModel.findUser(payload.email);
  if (user && user.status !== "active") {
    throw new HttpError("Your account has been suspended.", 403);
  }

  let newUser;
  const password = randomBytes(12)
    .toString("base64")
    .slice(0, 12)
    .replace(/\+/g, "A")
    .replace(/\//g, "B");
  const hashedPassword = await bcrypt.hash(password, 10);
  if (!user) {
    newUser = await registerUser({
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      avatar: payload.picture,
      password: hashedPassword,
      role: "user",
      status: "active",
      verified: true,
    });
    const template = await authModel.findEmailTemplate({
      where: { name: "newPassword" },
    });
    if (template) {
      sendPasswordMail({
        to: newUser.email,
        name: newUser.firstName,
        password,
        template,
      });
    }
  }

  const accountUser = user ?? { ...newUser, kyc: { status: "false" } };

  const exp = Math.floor(Date.now() / 1000) + 60 * 60;

  const token = await jwt.sign(
    {
      exp,
      data: {
        id: accountUser?.id,
        email: accountUser?.email,
        role: accountUser?.role,
      },
    },
    process.env.JWT_SECRET || "eyJmb28iOiJiYXIifQ"
  );

  return {
    token,
    id: accountUser?.id,
    firstName: accountUser?.firstName,
    lastName: accountUser?.lastName,
    email: accountUser?.email,
    createdAt: accountUser?.createdAt,
    role: accountUser?.role,
    avatar: accountUser?.avatar,
    kyc: accountUser?.kyc,
  };
};

export const resetPassword = async (id: number, newPassword: string) => {
  const password = await bcrypt.hash(newPassword, 10);
  return authModel.resetPassword(id, password);
};
