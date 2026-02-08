import { NextFunction, Request, Response } from "express";
import * as blogCommentService from "./blogComment.service";

export const updateMyComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as Request & { user: { data: { id: number; role: string } } };
        const updated = await blogCommentService.updateMyComment({
            id: Number(req.params.id),
            authId: user.data.id,
            content: req.body.content,
        });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as Request & { user: { data: { id: number; role: string } } };
        await blogCommentService.deleteComment({
            id: Number(req.params.id),
            role: user.data.role,
            authId: user.data.id,
        });
        res.status(204).json({ message: "Deleted comment successfully." });
    } catch (err) {
        next(err);
    }
};

export const setVisibility = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as Request & { user: { data: { id: number; role: string } } };
        const updated = await blogCommentService.setCommentVisibilityAdmin({
            id: Number(req.params.id),
            role: user.data.role,
            isHidden: req.body.isHidden,
        });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

export const listAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as Request & { user: { data: { id: number; role: string } } };
        const list = await blogCommentService.listCommentsAdmin({
            role: user.data.role,
            ...(req.query as any),
        });
        res.json(list);
    } catch (err) {
        next(err);
    }
};