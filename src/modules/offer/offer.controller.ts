import { NextFunction, Request, Response } from "express";
import * as offerService from "./offer.service";

export const createOffer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      sellerId,
      offerType,
      discountType,
      status,
      discountValue,
      startDate,
      endDate,
    } = req.body;

    const { user } = req as Request & {
      user: { data: { id: number; role: "admin" | "seller" } };
    };

    // ❌ Unauthorized role
    if (!["admin", "seller"].includes(user.data.role)) {
      return res.status(403).json({
        message: "You don't have permission to create offer.",
      });
    }

    let finalSellerId: number | undefined;

    if (user.data.role === "seller") {
      // seller can only create for themselves
      if (sellerId && sellerId !== user.data.id) {
        return res.status(403).json({
          message: "Only you can create offers for yourself.",
        });
      }
      finalSellerId = user.data.id;
    }

    if (user.data.role === "admin") {
      finalSellerId = sellerId;
    }

    const offer = await offerService.createOffer({
      name,
      sellerId: finalSellerId,
      offerType,
      discountType,
      status,
      discountValue,
      startDate,
      endDate,
    });

    return res.status(201).json(offer);
  } catch (err) {
    next(err);
  }
};

export const updateOffer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      sellerId,
      offerType,
      discountType,
      status,
      discountValue,
      startDate,
      endDate,
    } = req.body;
    const updateData = Object.fromEntries(
      Object.entries({
        name,
        sellerId,
        offerType,
        discountType,
        status,
        discountValue,
        startDate,
        endDate,
      }).filter(([_, value]) => value !== undefined),
    );
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    const offer = await offerService.getOffer({ id: +req.params.id });
    if (!offer) return res.status(400).json({ message: "Offer not found" });

    if (user.data.role === "admin" || user.data.role === "seller") {
      if (user.data.role === "seller" && sellerId && sellerId != user.data.id) {
        return res
          .status(403)
          .json({ message: "Only you can create products for yourself." });
      }
      if (
        sellerId
          ? offer.sellerId !== +sellerId
          : offer.sellerId !== +user.data.id
      ) {
        return res.status(403).json({
          message: "You don't have permission to create offer.",
        });
      }

      const updatedOffer = await offerService.updateOffer(
        +req.params.id,
        updateData,
      );

      res.status(201).json(updatedOffer);
    } else {
      return res.status(403).json({
        message: "You don't have permission to update offer.",
      });
    }
  } catch (err) {
    next(err);
  }
};

export const deleteOffer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    await offerService.deleteOffer({
      id: +req.params.id,
      role: user.data.role,
      authId: user.data.id,
    });
    res.status(204).json({ message: "Deleted offer successfully." });
  } catch (err) {
    next(err);
  }
};

export const getOffer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = await req.params.id;
    let offer;
    if (parseInt(query)) {
      offer = await offerService.getOffer({
        id: +query,
      });
    } else {
      res.status(422).json({ message: "Invalid query." });
    }

    res.json(offer);
  } catch (err) {
    next(err);
  }
};

export const getOffers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, search, sellerId } = await req.query;

    const finalQuery = Object.fromEntries(
      Object.entries({
        page,
        limit,
        search,
        sellerId,
      }).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
    const offers = await offerService.getOffers(finalQuery);
    res.status(200).json(offers);
  } catch (err) {
    next(err);
  }
};
