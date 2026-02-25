import { NextFunction, Request, Response } from "express";
import * as orderService from "./order.service";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as any;
    const order = await orderService.createOrder(user.data.id, req.body);
    res.status(201).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as any;
    const result = await orderService.getOrders(
      user.data.id,
      user.data.role,
      req.query,
    );
    res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as any;
    const order = await orderService.getOrderById(
      Number(req.params.id),
      user.data.id,
      user.data.role,
    );
    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as any;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(
      Number(req.params.id),
      status,
      user.data.id,
      user.data.role,
    );
    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as any;
    const { reason } = req.body;
    const order = await orderService.cancelOrder(
      Number(req.params.id),
      user.data.id,
      reason,
    );
    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const returnOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as any;
    const order = await orderService.returnOrder(
      Number(req.params.id),
      user.data.id,
      req.body,
    );
    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};
