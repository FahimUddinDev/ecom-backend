import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { HttpError } from "../../utils/customError";
import * as userModel from "./user.model";

export const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
  role,
  avatar,
}: Prisma.UserCreateInput) => {
  const existing = await userModel.findUser({ where: { email } });
  if (existing) throw new HttpError("Email already exist!", 409);
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.createUser({
    firstName: firstName.toLowerCase(),
    lastName: lastName?.toLowerCase(),
    email,
    password: hashedPassword,
    role,
    status: !role || role === "user" ? "active" : "pending",
    avatar: avatar ? `/public/${avatar}` : null,
  });
  return { ...user, kyc: { status: "false" } };
};

export const getAllUsers = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  verified?: boolean;
  kyc?: boolean;
  createdAt?: string | { from?: string; to?: string };
  orderBy?: "asc" | "desc";
}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.search) {
    const keyword = query.search.toLowerCase();
    where.OR = [
      { firstName: { contains: keyword } },
      { lastName: { contains: keyword } },
      { email: { contains: keyword } },
    ];
  }

  if (query.role) where.role = query.role;
  if (typeof query.status) where.status = query.status;
  if (typeof query.verified === "boolean") where.verified = query.verified;
  if (typeof query.kyc === "boolean") where.kyc = query.kyc;

  // createdAt filter
  if (query.createdAt) {
    if (typeof query.createdAt === "string") {
      where.createdAt = { equals: new Date(query.createdAt) };
    } else if (typeof query.createdAt === "object") {
      where.createdAt = {};
      if (query.createdAt.from) {
        where.createdAt.gte = new Date(query.createdAt.from);
      }
      if (query.createdAt.to) {
        where.createdAt.lte = new Date(query.createdAt.to);
      }
    }
  }

  const orderBy = { createdAt: query.orderBy === "asc" ? "asc" : "desc" };

  // 🔥 Get total count before pagination
  const total = await userModel.countUsers({ where });

  // 🔥 Get paginated users
  const users = await userModel.findAllUsers({
    where,
    skip,
    take: limit,
    orderBy,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
      role: true,
      status: true,
      verified: true,
      avatar: true,
      kyc: {
        select: {
          status: true,
        },
      },
    },
  });

  return {
    total,
    page,
    limit,
    users,
  };
};

export const getUser = async (query: { id: number } | { email: string }) => {
  const user = await userModel.findUser({
    where: query,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
      role: true,
      status: true,
      verified: true,
      avatar: true,
      kyc: {
        select: {
          status: true,
        },
      },
    },
  });
  if (!user) throw new HttpError("User Not found!", 404);
  return user;
};

export const updateUser = async (
  id: number,
  data: Partial<{
    firstName: string;
    password: string;
    lastName: string;
    avatar: string;
  }>
) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  // 2. Delete old avatar if new avatar is provided
  if (data?.avatar) {
    const existingUser = await userModel.findUser({ where: { id } });
    const oldAvatarPath = existingUser?.avatar;

    if (oldAvatarPath) {
      const filename = oldAvatarPath.replace("/public/", "");
      const filePath = path.join(__dirname, "../../../../uploads", filename);
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete old avatar:", err);
          });
        }
      });
    }
  }

  return userModel.updateUser(id, data);
};

export const deleteUser = async ({
  id,
  role,
  authId,
}: {
  id: number;
  authId: number;
  role: string;
}) => {
  if ((role === "user" || role === "seller") && id !== authId) {
    throw new HttpError("Permission denied!", 403);
  }
  return userModel.deleteUser(id);
};
