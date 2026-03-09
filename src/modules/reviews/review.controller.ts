import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../utils/customError";
import * as reviewService from "./review.service";

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, orderId, orderItemId, rating, comment, images, userId } =
      req.body;

    const { user } = req as Request & {
      user: { data: { id: number } };
    };

    const product = await reviewService.getProduct(+productId);
    if (!product) {
      throw new HttpError("Product not found!", 404);
    }
    if (product.sellerId === user.data.id) {
      throw new HttpError("You can't review your own product!", 400);
    }
    const order = await reviewService.getOrder(+orderId);
    if (!order) {
      throw new HttpError("Order not found!", 404);
    }

    const orderItem = await reviewService.getOrderItem(+orderItemId);

    if (!orderItem) {
      throw new HttpError("Order item not found!", 404);
    }
    if (orderItem.status !== "delivered") {
      throw new HttpError("You can't review this order!", 400);
    }
    if (orderItem.isReviewed) {
      throw new HttpError("You have already reviewed this order!", 400);
    }
    const review = await reviewService.createReview({
      productId: +productId,
      userId: user.data.id,
      orderId,
      orderItemId,
      rating,
      comment,
      images,
    });

    await reviewService.updateOrderItem(+orderItemId);

    return res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Request & {
      user: { data: { id: number } };
    };
    const id = Number(req.params.id);

    const review = await reviewService.getReview({ id });

    if (review.userId !== user.data.id) {
      throw new HttpError("You can't update this review!", 403);
    }

    const updatedReview = await reviewService.updateReview(id, req.body);
    res.status(200).json(updatedReview);
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Request & {
      user: { data: { id: number } };
    };
    const id = Number(req.params.id);

    const review = await reviewService.getReview({ id });

    if (review.userId !== user.data.id) {
      throw new HttpError("You can't delete this review!", 403);
    }

    await reviewService.deleteReview(id);
    res.status(200).json({ message: "Deleted review successfully." });
  } catch (err) {
    next(err);
  }
};

export const getReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      throw new HttpError("Invalid review id.", 422);
    }

    const review = await reviewService.getReview({
      id,
    });

    return res.json(review);
  } catch (err) {
    next(err);
  }
};

export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, userId, productId } = req.query;

    const finalQuery = Object.fromEntries(
      Object.entries({
        page,
        limit,
        userId,
        productId,
      }).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
    const reviews = await reviewService.getReviews(finalQuery);
    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
};
