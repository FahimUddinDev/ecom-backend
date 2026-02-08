import { NextFunction, Request, Response } from "express";
import * as offerOnProductService from "./offerOnProduct.service";

export const createOfferOnProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, offerId } = req.body;

    const { user } = req as Request & {
      user: { data: { id: number; role: "admin" | "seller" } };
    };

    //    Permission check
    if (!["admin", "seller"].includes(user.data.role)) {
      return res.status(403).json({
        message: "You don't have permission to create add offer on product.",
      });
    }

    const offer = await offerOnProductService.getOffer(offerId);
    if (!offer) {
      return res.status(400).json({
        message: "Invalid offer id",
      });
    }

    const product = await offerOnProductService.getProduct(productId);
    if (!product) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    if (offer.sellerId !== product.sellerId) {
      return res.status(400).json({
        message: "Invalid product id or offer id",
      });
    }

    if (user.data.role === "seller" && user.data.id !== offer.sellerId) {
      return res.status(403).json({
        message: "you don't have permission to add offer on this product!",
      });
    }

    const offerOnProduct = await offerOnProductService.createOfferOnProduct({
      productId,
      offerId,
    });

    return res.status(201).json(offerOnProduct);
  } catch (err) {
    next(err);
  }
};

export const updateOfferOnProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, offerId } = req.body;
    const updateData = Object.fromEntries(
      Object.entries({
        productId,
        offerId,
      }).filter(([_, value]) => value !== undefined),
    );
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    const offerOnProduct = await offerOnProductService.getOfferOnProduct({
      id: +req.params.id,
    });
    if (!offerOnProduct)
      return res.status(400).json({ message: "Offer  not found" });

    const offer = await offerOnProductService.getOffer(offerId);
    if (!offer) {
      return res.status(400).json({
        message: "Invalid offer id",
      });
    }

    const product = await offerOnProductService.getProduct(productId);
    if (!product) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    if (user.data.role === "admin" || user.data.role === "seller") {
      if (
        user.data.role === "seller" &&
        (product.sellerId !== user.data.id || offer.sellerId !== user.data.id)
      ) {
        return res
          .status(403)
          .json({ message: "Only you can create products for yourself." });
      }

      const updatedOfferOnProduct =
        await offerOnProductService.updateOfferOnProduct(
          +req.params.id,
          updateData,
        );

      res.status(201).json(updatedOfferOnProduct);
    } else {
      return res.status(403).json({
        message: "You don't have permission to update offer.",
      });
    }
  } catch (err) {
    next(err);
  }
};

// export const deleteOffer = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const { user } = req as Request & {
//       user: { data: { id: number; role: string } };
//     };
//     await offerService.deleteOffer({
//       id: +req.params.id,
//       role: user.data.role,
//       authId: user.data.id,
//     });
//     res.status(204).json({ message: "Deleted offer successfully." });
//   } catch (err) {
//     next(err);
//   }
// };

// export const getOffer = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const query = await req.params.id;
//     let offer;
//     if (parseInt(query)) {
//       offer = await offerService.getOffer({
//         id: +query,
//       });
//     } else {
//       res.status(422).json({ message: "Invalid query." });
//     }

//     res.json(offer);
//   } catch (err) {
//     next(err);
//   }
// };

// export const getOffers = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const { page, limit, search, sellerId } = await req.query;

//     const finalQuery = Object.fromEntries(
//       Object.entries({
//         page,
//         limit,
//         search,
//         sellerId,
//       }).filter(
//         ([_, value]) => value !== undefined && value !== null && value !== "",
//       ),
//     );
//     const offers = await offerService.getOffers(finalQuery);
//     res.status(200).json(offers);
//   } catch (err) {
//     next(err);
//   }
// };
