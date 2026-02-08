import { NextFunction, Request, Response } from "express";
import * as blogCategoryService from "./blogCategory.service";

export const createBlogCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // type assertion for user
        const { user } = req as Request & { user: { data: { id: number, role: string } } };
        const created = await blogCategoryService.createBlogCategory({
            role: user.data.role,
            name: req.body.name,
            slug: req.body.slug,
            status: req.body.status
        })
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
}

export const getBlogCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cats = await blogCategoryService.getBlogCategoriesPublic();
        res.json(cats);
    } catch (err) {
        next(err);
    }
};

export const updateBlogCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as Request & { user: { data: { id: number; role: string } } };
        const updated = await blogCategoryService.updateBlogCategory({
            role: user.data.role,
            id: Number(req.params.id),
            data: req.body,
        });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

export const deleteBlogCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as Request & { user: { data: { id: number; role: string } } };
        await blogCategoryService.deleteBlogCategory({ role: user.data.role, id: Number(req.params.id) });
        res.status(204).json({ message: "Deleted blog category successfully." });
    } catch (err) {
        next(err);
    }
};