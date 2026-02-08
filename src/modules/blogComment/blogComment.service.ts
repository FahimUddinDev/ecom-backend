import { HttpError } from "../../utils/customError";
import * as blogCommentModel from "./blogComment.model";

export const updateMyComment = async ({
    id,
    authId,
    content,
}: {
    id: number;
    authId: number;
    content: string;
}) => {
    const existing = await blogCommentModel.findComment({
        where: { id },
        select: { id: true, userId: true, deletedAt: true },
    });
    if (!existing || existing.deletedAt) throw new HttpError("Comment not found!", 404);
    if (existing.userId !== authId) throw new HttpError("Permission denied!", 403);

    return blogCommentModel.updateComment({
        where: { id },
        data: { content },
    });
};

export const deleteComment = async ({
    id,
    role,
    authId,
}: {
    id: number;
    role: string;
    authId: number;
}) => {
    const existing = await blogCommentModel.findComment({
        where: { id },
        select: { id: true, userId: true, deletedAt: true },
    });
    if (!existing || existing.deletedAt) throw new HttpError("Comment not found!", 404);

    const isOwner = existing.userId === authId;
    const isAdmin = role === "admin";

    if (!isOwner && !isAdmin) throw new HttpError("Permission denied!", 403);

    return blogCommentModel.updateComment({
        where: { id },
        data: {
            deletedAt: new Date(),
            deletedById: authId,
            isHidden: true,
            content: "[deleted]",
        },
    });
};

export const setCommentVisibilityAdmin = async ({
    id,
    role,
    isHidden,
}: {
    id: number;
    role: string;
    isHidden: boolean;
}) => {
    if (role !== "admin") throw new HttpError("Permission denied!", 403);

    const existing = await blogCommentModel.findComment({
        where: { id },
        select: { id: true, deletedAt: true },
    });
    if (!existing || existing.deletedAt) throw new HttpError("Comment not found!", 404);

    return blogCommentModel.updateComment({
        where: { id },
        data: { isHidden },
    });
};

// optional: admin list for panel (filters)
export const listCommentsAdmin = async (query: {
    role: string;
    search?: any;
    postId?: any;
    hidden?: any;
    deleted?: any;
}) => {
    if (query.role !== "admin") throw new HttpError("Permission denied!", 403);

    const where: any = {};
    if (query.postId) where.postId = Number(query.postId);

    if (query.hidden !== undefined) where.isHidden = String(query.hidden) === "true";
    if (query.deleted !== undefined) {
        where.deletedAt = String(query.deleted) === "true" ? { not: null } : null;
    }

    if (query.search) {
        const keyword = String(query.search).toLowerCase();
        where.OR = [{ content: { contains: keyword } }];
    }

    return blogCommentModel.findComments({
        where,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            content: true,
            isHidden: true,
            deletedAt: true,
            createdAt: true,
            post: { select: { id: true, title: true, slug: true } },
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
    });
};