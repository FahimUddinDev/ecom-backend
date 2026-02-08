import { NextFunction, Request, Response } from "express";
import * as blogService from "./blog.service";

export const createBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as Request & { user: { data: { id: number; role: string } } };
        const created = await blogService.createBlog({
            authId: user.data.id,
            role: user.data.role,
            data: req.body,
        });
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
};

export const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as Request & { user: { data: { id: number; role: string } } };
        const updated = await blogService.updateBlog({
            role: user.data.role,
            id: Number(req.params.id),
            data: req.body,
        });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

export const setBlogStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as Request & { user: { data: { id: number; role: string } } };
        const updated = await blogService.setBlogStatus({
            role: user.data.role,
            id: Number(req.params.id),
            status: req.body.status,
        });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

export const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as Request & { user: { data: { id: number; role: string } } };
        await blogService.deleteBlog({ role: user.data.role, id: Number(req.params.id) });
        res.status(204).json({ message: "Deleted blog successfully." });
    } catch (err) {
        next(err);
    }
};

export const getBlogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await blogService.getBlogs(req.query as any);
        res.json(posts);
    } catch (err) {
        next(err);
    }
};

export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const post = await blogService.getBlogBySlugPublic(req.params.slug);
        res.json(post);
    } catch (err) {
        next(err);
    }
};

export const getBlogComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // reuse getBlogBySlugPublic to ensure active
        const post = await blogService.getBlogBySlugPublic(req.params.slug);
        const comments = await blogService.getBlogCommentsPublic(post.id);
        res.json(comments);
    } catch (err) {
        next(err);
    }
};

export const createBlogComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as Request & { user: { data: { id: number; role: string } } };
        const created = await blogService.createBlogComment({
            authId: user.data.id,
            slug: req.params.slug,
            content: req.body.content,
            parentId: req.body.parentId ?? null,
        });
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
};