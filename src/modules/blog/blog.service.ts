import { Prisma, Status } from "@prisma/client";
import fs from "fs";
import path from "path";
import { HttpError } from "../../utils/customError";
import * as blogModel from "./blog.model";

const normalizePublicPath = (value?: string | null) => {
    if (!value) return value;
    return value.startsWith("/public/") ? value : `/public/${value}`;
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

const deleteUploadedFileByPublicPath = (publicPath?: string | null) => {
    if (!publicPath) return;
    const filename = publicPath.replace("/public/", "");
    const filePath = path.join(__dirname, "../../../../uploads", filename);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) fs.unlink(filePath, () => { });
    });
};

export const createBlog = async ({
    authId,
    role,
    data,
}: {
    authId: number;
    role: string;
    data: {
        thumbnail: string;
        title: string;
        description: string;
        categoryId: number;
        slug?: string;
        seoTitle?: string;
        seoDescription?: string;
        status?: Status;
    };
}) => {
    if (role !== "admin") throw new HttpError("Permission denied!", 403);

    const slug = data.slug
        ? slugify(data.slug)
        : `${slugify(data.title)}-${Date.now()}`;

    const existing = await blogModel.findPostUnique({ where: { slug } });
    if (existing) throw new HttpError("Blog slug already exists!", 409);

    const status = data.status ?? "active";

    return blogModel.createPost({
        thumbnail: normalizePublicPath(data.thumbnail)!,
        title: data.title,
        description: data.description,
        slug,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        status,
        publishedAt: status === "active" ? new Date() : null,
        author: { connect: { id: authId } },
        category: { connect: { id: data.categoryId } },
    });
};

export const updateBlog = async ({
    role,
    id,
    data,
}: {
    role: string;
    id: number;
    data: Partial<{
        thumbnail: string;
        title: string;
        description: string;
        categoryId: number;
        slug: string;
        seoTitle: string | null;
        seoDescription: string | null;
        status: Status;
    }>;
}) => {
    if (role !== "admin") throw new HttpError("Permission denied!", 403);

    const existing = await blogModel.findPostUnique({
        where: { id },
        select: { id: true, thumbnail: true, status: true },
    });
    if (!existing) throw new HttpError("Blog not found!", 404);

    if (data.slug) {
        const newSlug = slugify(data.slug);
        const dup = await blogModel.findPostUnique({ where: { slug: newSlug } });
        if (dup && dup.id !== id) throw new HttpError("Slug already in use!", 409);
        data.slug = newSlug;
    }

    if (data.thumbnail) {
        // delete old file if thumbnail replaced
        deleteUploadedFileByPublicPath(existing.thumbnail);
        data.thumbnail = normalizePublicPath(data.thumbnail)!;
    }

    // publishedAt logic: set when moving to active (optional)
    const publishedAt =
        data.status === "active" && existing.status !== "active"
            ? new Date()
            : undefined;

    return blogModel.updatePost({
        where: { id },
        data: {
            ...data,
            publishedAt,
            category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
        } as any,
    });
};

export const setBlogStatus = async ({
    role,
    id,
    status,
}: {
    role: string;
    id: number;
    status: Status;
}) => {
    return updateBlog({ role, id, data: { status } });
};

export const deleteBlog = async ({ role, id }: { role: string; id: number }) => {
    if (role !== "admin") throw new HttpError("Permission denied!", 403);

    const existing = await blogModel.findPostUnique({
        where: { id },
        select: { id: true, thumbnail: true },
    });
    if (!existing) throw new HttpError("Blog not found!", 404);

    deleteUploadedFileByPublicPath(existing.thumbnail);

    return blogModel.deletePost({ where: { id } });
};

// PUBLIC LIST (active only) + SEARCH
export const getBlogs = async (query: {
    page?: any;
    limit?: any;
    search?: any;
    categoryId?: any;
}) => {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {
        status: "active",
    };

    if (query.categoryId) where.categoryId = Number(query.categoryId);

    if (query.search) {
        const keyword = String(query.search).toLowerCase();
        where.OR = [
            { title: { contains: keyword } as any },
            { description: { contains: keyword } as any },
            { slug: { contains: keyword } as any },
        ];
    }

    const total = await blogModel.countPosts({ where });

    const posts = await blogModel.findPosts({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            thumbnail: true,
            title: true,
            slug: true,
            seoTitle: true,
            seoDescription: true,
            createdAt: true,
            category: { select: { id: true, name: true, slug: true } },
            author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
    });

    return { total, page, limit, posts };
};

export const getBlogBySlugPublic = async (slug: string) => {
    const post = await blogModel.findPostUnique({
        where: { slug },
        select: {
            id: true,
            thumbnail: true,
            title: true,
            description: true,
            slug: true,
            seoTitle: true,
            seoDescription: true,
            createdAt: true,
            category: { select: { id: true, name: true, slug: true } },
            author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
    });

    if (!post) throw new HttpError("Blog not found!", 404);

    // enforce enabled for webview
    const full = await blogModel.findPostUnique({
        where: { slug },
        select: { status: true },
    });
    if (full?.status !== "active") throw new HttpError("Blog not available!", 404);

    return post;
};

// COMMENTS (public list + user create)
export const getBlogCommentsPublic = async (postId: number) => {
    const comments = await blogModel.findComments({
        where: {
            postId,
            parentId: null,
            isHidden: false,
            deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            replies: {
                where: { isHidden: false, deletedAt: null },
                orderBy: { createdAt: "asc" },
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                    user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                },
            },
        },
    });

    return comments;
};

export const createBlogComment = async ({
    authId,
    slug,
    content,
    parentId,
}: {
    authId: number;
    slug: string;
    content: string;
    parentId?: number | null;
}) => {
    const post = await blogModel.findPostUnique({
        where: { slug },
        select: { id: true, status: true },
    });
    if (!post || post.status !== "active") {
        throw new HttpError("Blog not available for comments!", 404);
    }

    if (parentId) {
        const parent = await blogModel.findCommentUnique({
            where: { id: parentId },
            select: { id: true, postId: true, deletedAt: true },
        });
        if (!parent || parent.postId !== post.id || parent.deletedAt) {
            throw new HttpError("Invalid parent comment!", 400);
        }
    }

    return blogModel.createComment({
        content,
        post: { connect: { id: post.id } },
        user: { connect: { id: authId } },
        parent: parentId ? { connect: { id: parentId } } : undefined,
    });
};