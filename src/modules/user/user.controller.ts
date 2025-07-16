// User controller
import { NextFunction, Request, Response } from "express";
import { User } from "../../../types/usersType";
import * as userService from "./user.service";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, password, role, avatar }: User =
      req.body;
    const user = await userService.registerUser({
      firstName,
      lastName,
      email,
      password,
      role,
      avatar,
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await req.query;
    const users = await userService.getAllUsers(query);
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await req.params.id;
    let user;
    if (parseInt(query)) {
      user = await userService.getUser({ id: +query });
    } else {
      user = await userService.getUser({ email: query });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      firstName,
      lastName,
      role,
      status,
      verified,
      kyc,
      avatar,
      password,
    } = req.body;
    const updateData = Object.fromEntries(
      Object.entries({
        firstName,
        lastName,
        role,
        status,
        verified,
        kyc,
        avatar,
        password,
      }).filter(([_, value]) => value !== undefined)
    );
    const user = await userService.updateUser(+req.params.id, updateData);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await userService.deleteUser(+req.params.id);
    res.status(200).json({ message: "Deleted user successfully." });
  } catch (err) {
    next(err);
  }
};
