import { NextFunction, Request, Response } from "express";
import * as couponService from "./coupon.service";

export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      code,
      referralCode,
      description,
      discountType,
      discountValue,
      usageLimit,
      startDate,
      endDate,
      productIds,
      variantIds,
      sellerId,
    } = req.body;

    const { user } = req as Request & {
      user: { data: { id: number; role: "admin" | "seller" } };
    };

    //  Unauthorized role
    if (!["admin", "seller"].includes(user.data.role)) {
      return res.status(403).json({
        message: "You don't have permission to create coupon.",
      });
    }

    let finalSellerId: number | undefined;

    if (user.data.role === "seller") {
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

    const coupon = await couponService.createCoupon({
      code,
      referralCode,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      productIds,
      variantIds,
      sellerId: finalSellerId,
      usageLimit,
    });

    return res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
};

// export const updateCoupon = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const {
//       name,
//       sellerId,
//       offerType,
//       discountType,
//       status,
//       discountValue,
//       startDate,
//       endDate,
//       productIds,
//       variantIds,
//     } = req.body;

//     const updateData = Object.fromEntries(
//       Object.entries({
//         name,
//         sellerId,
//         offerType,
//         discountType,
//         status,
//         discountValue,
//         startDate,
//         endDate,
//         productIds,
//         variantIds,
//       }).filter(([_, value]) => value !== undefined),
//     );

//     const { user } = req as Request & {
//       user: { data: { id: number; role: "admin" | "seller" } };
//     };

//     const offer = await offerService.getOffer({ id: +req.params.id });

//     if (!offer) {
//       return res.status(404).json({
//         message: "Offer not found",
//       });
//     }

//     if (!["admin", "seller"].includes(user.data.role)) {
//       return res.status(403).json({
//         message: "You don't have permission to update offer.",
//       });
//     }

//     if (user.data.role === "seller") {
//       if (sellerId && Number(sellerId) !== user.data.id) {
//         return res.status(403).json({
//           message: "Only you can update offers for yourself.",
//         });
//       }

//       if (offer.sellerId !== user.data.id) {
//         return res.status(403).json({
//           message: "You don't own this offer.",
//         });
//       }
//     }

//     if (user.data.role === "admin") {
//       updateData.sellerId = sellerId ?? offer.sellerId;
//     }

//     const updatedOffer = await offerService.updateOffer(
//       +req.params.id,
//       updateData,
//     );

//     return res.status(200).json(updatedOffer);
//   } catch (err) {
//     next(err);
//   }
// };

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
//     const id = Number(req.params.id);

//     if (!id || isNaN(id)) {
//       return res.status(422).json({
//         message: "Invalid offer id.",
//       });
//     }

//     const offer = await offerService.getOffer({
//       id,
//     });

//     return res.json(offer);
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
