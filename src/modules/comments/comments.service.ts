import { HttpError } from "../../utils/customError";
import * as commentsModel from "./comments.model";

export const createComment = async (data: {
  productId: number;
  userId?: number;
  content: string;
  images?: string[];
  parentId?: number;
}) => {
  return commentsModel.createComment({
    product: { connect: { id: data.productId } },
    content: data.content,
    images: data.images,
    ...(data.userId && { user: { connect: { id: data.userId } } }),
    ...(data.parentId && { parent: { connect: { id: data.parentId } } }),
  });
};

export const getComment = async (id: number) => {
  const comment = await commentsModel.findComment({
    where: { id },
  });
  if (!comment) throw new HttpError("Comment not found!", 404);
  return comment;
};

export const updateComment = async (
  id: number,
  data: { content?: string; images?: string[] },
) => {
  return commentsModel.updateComment(id, data);
};

export const deleteComment = async (id: number) => {
  return commentsModel.deleteComment(id);
};

export const getComments = async (query: {
  page?: string;
  limit?: string;
  productId?: string;
  userId?: string;
}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const where: any = {
    parentId: null, // Only fetch top-level comments by default
  };

  if (query.productId) {
    where.productId = Number(query.productId);
  }
  if (query.userId) {
    where.userId = Number(query.userId);
  }

  const [total, comments] = await Promise.all([
    commentsModel.countComments({ where }),
    commentsModel.findComments({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    total,
    page,
    limit,
    comments,
  };
};

export const getProductSeller = async (productId: number) => {
  const product = await (commentsModel as any).prisma.product.findUnique({
    where: { id: productId },
    select: { sellerId: true },
  });
  return product?.sellerId;
};
