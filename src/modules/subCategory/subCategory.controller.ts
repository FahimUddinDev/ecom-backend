// User controller
import { SubCategories } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import * as subCategoryService from "./subCategory.service";

export const createSubCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, thumbnail, categoryId }: SubCategories = req.body;
    const subCategory = await subCategoryService.createSubCategory({
      categoryId,
      name,
      thumbnail,
    });

    res.status(201).json(subCategory);
  } catch (err) {
    next(err);
  }
};

export const getSubCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query = await req.query;
  try {
    const subCategory = await subCategoryService.getSubCategories(query);
    res.status(200).json(subCategory);
  } catch (err) {
    next(err);
  }
};

export const getSubCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await req.params.slug;
    const subCategory = await subCategoryService.getSubCategory({ id: +query });
    res.status(200).json(subCategory);
  } catch (err) {
    next(err);
  }
};

export const updateSubCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = await req.params.slug;
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    const { name, thumbnail }: SubCategories = req.body;
    const subCategory = await subCategoryService.updateSubCategory(
      parseInt(id),
      user.data.role,
      {
        name,
        thumbnail,
      }
    );

    res.status(200).json(subCategory);
  } catch (err) {
    next(err);
  }
};

export const deleteSubCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = await req.params.slug;
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    await subCategoryService.deleteSubCategory({
      id: parseInt(id),
      role: user.data.role,
    });

    res.status(204).json({ message: "Deleted Sub category successfully." });
  } catch (err) {
    next(err);
  }
};
