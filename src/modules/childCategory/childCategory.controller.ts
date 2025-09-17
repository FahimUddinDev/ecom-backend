// User controller
import { ChildCategories } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import * as childCategoryService from "./childCategory.service";

export const createChildCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, thumbnail, subCategoryId }: ChildCategories = req.body;
    const childCategory = await childCategoryService.createChildCategory({
      subCategoryId,
      name,
      thumbnail,
    });

    res.status(201).json(childCategory);
  } catch (err) {
    next(err);
  }
};

export const getChildCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query = await req.query;
  try {
    const childCategory = await childCategoryService.getChildCategories(query);
    res.status(200).json(childCategory);
  } catch (err) {
    next(err);
  }
};

export const getChildCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await req.params.slug;
    const childCategory = await childCategoryService.getChildCategory({
      id: +query,
    });
    res.status(200).json(childCategory);
  } catch (err) {
    next(err);
  }
};

export const updateChildCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = await req.params.slug;
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    const { name, thumbnail }: ChildCategories = req.body;
    const childCategory = await childCategoryService.updateChildCategory(
      parseInt(id),
      user.data.role,
      {
        name,
        thumbnail,
      }
    );

    res.status(200).json(childCategory);
  } catch (err) {
    next(err);
  }
};

export const deleteChildCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = await req.params.slug;
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    await childCategoryService.deleteChildCategory({
      id: parseInt(id),
      role: user.data.role,
    });

    res.status(204).json({ message: "Deleted Child category successfully." });
  } catch (err) {
    next(err);
  }
};
