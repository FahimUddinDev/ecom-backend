import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../utils/customError";
import * as commentsService from "./comments.service";

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, content, images, parentId } = req.body;
    const { user } = req as any;

    const comment = await commentsService.createComment({
      productId: +productId,
      content,
      images,
      parentId: parentId ? +parentId : undefined,
      userId: user?.data?.id,
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

export const createReply = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { content, images } = req.body;
    const parentId = +req.params.id;
    const { user } = req as any;

    const parentComment = await commentsService.getComment(parentId);
    const productSellerId = await commentsService.getProductSeller(
      parentComment.productId,
    );

    // Authorization logic for replies
    const isAdmin = user.data.role === "admin";
    const isSellerOfProduct = user.data.id === productSellerId;
    const isUserReplyingToSeller = parentComment.userId === productSellerId;

    if (!isAdmin && !isSellerOfProduct && !isUserReplyingToSeller) {
      throw new HttpError(
        "You are not authorized to reply to this comment!",
        403,
      );
    }

    const reply = await commentsService.createComment({
      productId: parentComment.productId,
      content,
      images,
      parentId,
      userId: user.data.id,
    });

    res.status(201).json(reply);
  } catch (err) {
    next(err);
  }
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = +req.params.id;
    const { user } = req as any;

    const comment = await commentsService.getComment(id);

    if (comment.userId !== user.data.id) {
      throw new HttpError("You can't update this comment!", 403);
    }

    const updatedComment = await commentsService.updateComment(id, req.body);
    res.status(200).json(updatedComment);
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = +req.params.id;
    const { user } = req as any;

    const comment = await commentsService.getComment(id);

    const isAdmin = user.data.role === "admin";
    if (comment.userId !== user.data.id && !isAdmin) {
      throw new HttpError(
        "You are not authorized to delete this comment!",
        403,
      );
    }

    await commentsService.deleteComment(id);
    res.status(200).json({ message: "Deleted comment successfully." });
  } catch (err) {
    next(err);
  }
};

export const getComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = +req.params.id;
    const comment = await commentsService.getComment(id);
    res.status(200).json(comment);
  } catch (err) {
    next(err);
  }
};

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const comments = await commentsService.getComments(req.query as any);
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};
