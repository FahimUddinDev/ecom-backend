import { NextFunction, Request, Response } from "express";
import * as additionalInfoService from "./additionalinfo.service";

export const createAdditionalInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId, productId, name, value } = req.body;

    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };

    const product = await additionalInfoService.getProduct(productId);
    if (!product) return res.status(400).json({ message: "Product not found" });

    if (user.data.role === "admin" || user.data.role === "seller") {
      if (user.data.role === "seller" && sellerId && sellerId != user.data.id) {
        return res.status(403).json({
          message: "Only you can create additionalInfos for yourself.",
        });
      }
      if (
        sellerId
          ? product.sellerId !== +sellerId
          : product.sellerId !== +user.data.id
      ) {
        return res.status(403).json({
          message: "You don't have permission to create additionalInfo.",
        });
      }
      const additionalInfo = await additionalInfoService.createAdditionalInfo({
        productId,
        name,
        value,
      });

      res.status(201).json(additionalInfo);
    } else {
      return res.status(403).json({
        message: "You don't have permission to create additionalInfo.",
      });
    }
  } catch (err) {
    next(err);
  }
};

export const createAdditionalInfos = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId, productId, additionalInfos } = req.body;

    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };

    const product = await additionalInfoService.getProduct(productId);
    if (!product) return res.status(400).json({ message: "Product not found" });

    if (user.data.role === "admin" || user.data.role === "seller") {
      if (user.data.role === "seller" && sellerId && sellerId != user.data.id) {
        return res.status(403).json({
          message: "Only you can create additionalInfos for yourself.",
        });
      }
      if (
        sellerId
          ? product.sellerId !== +sellerId
          : product.sellerId !== +user.data.id
      ) {
        return res.status(403).json({
          message: "You don't have permission to create additionalInfo.",
        });
      }

      if (!Array.isArray(additionalInfos) || additionalInfos.length === 0) {
        return res.status(400).json({
          message: "additionalInfos must be a non-empty array",
        });
      }

      const result = await additionalInfoService.createAdditionalInfos({
        productId,
        additionalInfos,
      });

      res.status(201).json(result);
    } else {
      return res.status(403).json({
        message: "You don't have permission to create additionalInfo.",
      });
    }
  } catch (err) {
    next(err);
  }
};

export const updateAdditionalInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId, productId, name, value } = req.body;
    const updateData = Object.fromEntries(
      Object.entries({
        sellerId,
        name,
        productId,
        value,
      }).filter(([_, value]) => value !== undefined),
    );
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    const product = await additionalInfoService.getProduct(productId);
    if (!product) return res.status(400).json({ message: "Product not found" });

    if (user.data.role === "admin" || user.data.role === "seller") {
      if (user.data.role === "seller" && sellerId && sellerId != user.data.id) {
        return res
          .status(403)
          .json({ message: "Only you can create products for yourself." });
      }
      if (
        sellerId
          ? product.sellerId !== +sellerId
          : product.sellerId !== +user.data.id
      ) {
        return res.status(403).json({
          message: "You don't have permission to create additionalInfo.",
        });
      }

      const additionalInfo = await additionalInfoService.updateAdditionalInfo(
        +req.params.id,
        updateData,
      );

      res.status(201).json(additionalInfo);
    } else {
      return res.status(403).json({
        message: "You don't have permission to update additionalInfo.",
      });
    }
  } catch (err) {
    next(err);
  }
};

export const deleteAdditionalInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    await additionalInfoService.deleteAdditionalInfo({
      id: +req.params.id,
      role: user.data.role,
      authId: user.data.id,
    });
    res.status(204).json({ message: "Deleted additionalInfo successfully." });
  } catch (err) {
    next(err);
  }
};

export const getAdditionalInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = await req.params.id;
    let additionalInfo;
    if (parseInt(query)) {
      additionalInfo = await additionalInfoService.getAdditionalInfo({
        id: +query,
      });
    } else {
      res.status(422).json({ message: "Invalid query." });
    }

    res.json(additionalInfo);
  } catch (err) {
    next(err);
  }
};

export const getAdditionalInfos = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, search, productId } = await req.query;

    const finalQuery = Object.fromEntries(
      Object.entries({
        page,
        limit,
        search,
        productId,
      }).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
    const additionalInfos =
      await additionalInfoService.getAdditionalInfos(finalQuery);
    res.status(200).json(additionalInfos);
  } catch (err) {
    next(err);
  }
};
