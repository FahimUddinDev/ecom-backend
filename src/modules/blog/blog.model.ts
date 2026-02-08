import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const createPost = (data: Prisma.BlogPostCreateInput) =>
    prisma.blogPost.create({ data });

export const findPostUnique = (args: Prisma.BlogPostFindUniqueArgs) =>
    prisma.blogPost.findUnique(args);

export const findPosts = (args: Prisma.BlogPostFindManyArgs) =>
    prisma.blogPost.findMany(args);

export const countPosts = (args: Prisma.BlogPostCountArgs) =>
    prisma.blogPost.count(args);

export const updatePost = (args: Prisma.BlogPostUpdateArgs) =>
    prisma.blogPost.update(args);

export const deletePost = (args: Prisma.BlogPostDeleteArgs) =>
    prisma.blogPost.delete(args);

// comments (for /blogs/:slug/comments endpoints)
export const createComment = (data: Prisma.BlogCommentCreateInput) =>
    prisma.blogComment.create({ data });

export const findComments = (args: Prisma.BlogCommentFindManyArgs) =>
    prisma.blogComment.findMany(args);

export const findCommentUnique = (args: Prisma.BlogCommentFindUniqueArgs) =>
    prisma.blogComment.findUnique(args);

export const updateComment = (args: Prisma.BlogCommentUpdateArgs) =>
    prisma.blogComment.update(args);