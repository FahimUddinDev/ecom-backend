// User controller
import { Categories } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import * as categoryService from "./category.service";

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, thumbnail }: Categories = req.body;
    const category = await categoryService.createCategory({
      name,
      thumbnail,
    });

    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};
