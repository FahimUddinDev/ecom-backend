import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findComment = (args: Prisma.BlogCommentFindUniqueArgs) =>
    prisma.blogComment.findUnique(args);

export const updateComment = (args: Prisma.BlogCommentUpdateArgs) =>
    prisma.blogComment.update(args);

export const findComments = (args: Prisma.BlogCommentFindManyArgs) =>
    prisma.blogComment.findMany(args);