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
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await categoryService.getCategories();
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await req.params.slug;
    let category;
    if (parseInt(query)) {
      category = await categoryService.getCategory({ id: +query });
    } else {
      category = await categoryService.getCategory({ name: query });
    }

    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = await req.params.slug;
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    const { name, thumbnail }: Categories = req.body;
    const category = await categoryService.updateCategory(
      parseInt(id),
      user.data.role,
      {
        name,
        thumbnail,
      }
    );

    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = await req.params.slug;
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    await categoryService.deleteCategory({
      id: parseInt(id),
      role: user.data.role,
    });

    res.status(204).json({ message: "Deleted category successfully." });
  } catch (err) {
    next(err);
  }
};
