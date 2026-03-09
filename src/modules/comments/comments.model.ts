import { Comment, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findComment = async (
  query: Prisma.CommentFindUniqueArgs,
): Promise<Comment | null> => {
  return prisma.comment.findUnique(query);
};

export const findComments = async (
  query: Prisma.CommentFindManyArgs,
): Promise<Comment[]> => {
  return prisma.comment.findMany({
    ...query,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
        },
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
            },
          },
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          sellerId: true,
        },
      },
    },
  });
};

export const createComment = async (
  data: Prisma.CommentCreateInput,
): Promise<Comment> => {
  return prisma.comment.create({
    data,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
        },
      },
    },
  });
};

export const updateComment = async (
  id: number,
  data: Prisma.CommentUpdateInput,
): Promise<Comment> => {
  return prisma.comment.update({
    where: { id },
    data,
  });
};

export const deleteComment = async (id: number): Promise<Comment> => {
  return prisma.comment.delete({
    where: { id },
  });
};

export const countComments = async (
  query: Prisma.CommentCountArgs,
): Promise<number> => {
  return prisma.comment.count(query);
};
