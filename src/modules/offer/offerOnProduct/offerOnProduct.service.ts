// import * as offerOnProductModel from "./offerOnProduct.model";

// export const getProduct = async (productId: number) => {
//   const product = await offerOnProductModel.findProduct({
//     where: { id: +productId },
//     select: {
//       id: true,
//       sellerId: true,
//     },
//   });
//   if (!product) throw new Error("Product not found");
//   return product;
// };

// export const getOffer = async (offerId: number) => {
//   const offer = await offerOnProductModel.findOffer({
//     where: { id: +offerId },
//     select: {
//       id: true,
//       sellerId: true,
//     },
//   });
//   if (!offer) throw new Error("Product not found");
//   return offer;
// };

// export const createOfferOnProduct = async ({
//   offerId,
//   productId,
// }: {
//   offerId: number;
//   productId: number;
// }) => {
//   const offerOnProduct = await offerOnProductModel.createOfferOnProduct({
//     product: { connect: { id: productId } },
//     offer: { connect: { id: offerId } },
//   });
//   return {
//     ...offerOnProduct,
//   };
// };

// export const updateOfferOnProduct = async (
//   id: number,
//   data: Partial<{
//     offerId?: number;
//     productId?: number;
//   }>,
// ) => {
//   const updatedOfferOnProduct = await offerOnProductModel.updateOfferOnProduct(
//     id,
//     data,
//   );

//   return updatedOfferOnProduct;
// };

// // export const deleteOfferOnProduct = async ({
// //   id,
// //   role,
// //   authId,
// // }: {
// //   id: number;
// //   authId: number;
// //   role: string;
// // }) => {
// //   const offerOnProduct = await offerOnProductModel.findOfferOnProduct({
// //     where: { id },
// //     select: {
// //       sellerId: true,
// //     },
// //   });
// //   if (!offerOnProduct) throw new HttpError("Offer not found!", 404);

// //   if (
// //     role !== "admin" &&
// //     !(role === "seller" && offerOnProduct.sellerId === authId)
// //   ) {
// //     throw new HttpError("Permission denied!", 403);
// //   }

// //   await offerOnProductModel.deleteOfferOnProduct(id);

// //   return { message: "Offer deleted successfully" };
// // };

// // export const getOfferOnProduct = async (query: { id: number }) => {
// //   const offer = await offerOnProductModel.findOfferOnProduct({
// //     where: query,
// //     select: {
// //       id: true,
// //       name: true,
// //       sellerId: true,
// //       offerType: true,
// //       discountType: true,
// //       status: true,
// //       discountValue: true,
// //       startDate: true,
// //       endDate: true,
// //     },
// //   });
// //   if (!offerOnProduct) throw new HttpError("Offer Not found!", 404);
// //   return offerOnProduct;
// // };

// // export const getOfferOnProducts = async (query: {
// //   page?: number;
// //   limit?: number;
// //   search?: string;
// //   sellerId?: string;
// //   sortBy?: string;
// //   createdAt?: string | { from?: string; to?: string };
// //   startDate?: string | { from?: string; to?: string };
// //   endDate?: string | { from?: string; to?: string };
// //   orderBy?: "asc" | "desc";
// // }) => {
// //   const page = query.page ? Number(query.page) : 1;
// //   const limit = query.limit ? Number(query.limit) : 10;
// //   const skip = (page - 1) * limit;

// //   const where: any = {};

// //   if (query.search) {
// //     const keyword = query.search.trim();
// //     where.OR = [{ name: { contains: keyword } }];
// //   }
// //   if (query.sellerId) where.sellerId = Number(query.sellerId);

// //   // createdAt filter
// //   if (query.createdAt) {
// //     if (typeof query.createdAt === "string") {
// //       where.createdAt = { equals: new Date(query.createdAt) };
// //     } else if (typeof query.createdAt === "object") {
// //       where.createdAt = {};
// //       if (query.createdAt.from) {
// //         where.createdAt.gte = new Date(query.createdAt.from);
// //       }
// //       if (query.createdAt.to) {
// //         where.createdAt.lte = new Date(query.createdAt.to);
// //       }
// //     }
// //   }
// //   // start at filter
// //   if (query.startDate) {
// //     if (typeof query.startDate === "string") {
// //       where.startDate = { equals: new Date(query.startDate) };
// //     } else if (typeof query.startDate === "object") {
// //       where.startDate = {};
// //       if (query.startDate.from) {
// //         where.startDate.gte = new Date(query.startDate.from);
// //       }
// //       if (query.startDate.to) {
// //         where.startDate.lte = new Date(query.startDate.to);
// //       }
// //     }
// //   }

// //   // end date filter
// //   // start at filter
// //   if (query.endDate) {
// //     if (typeof query.endDate === "string") {
// //       where.endDate = { equals: new Date(query.endDate) };
// //     } else if (typeof query.endDate === "object") {
// //       where.endDate = {};
// //       if (query.endDate.from) {
// //         where.endDate.gte = new Date(query.endDate.from);
// //       }
// //       if (query.endDate.to) {
// //         where.endDate.lte = new Date(query.endDate.to);
// //       }
// //     }
// //   }
// //   let orderBy: any[] = [];

// //   if (query.sortBy) {
// //     const fields = query.sortBy.split(",");
// //     const direction = query.orderBy === "asc" ? "asc" : "desc";

// //     orderBy.push(
// //       ...fields.map((field) => ({
// //         [field]: direction,
// //       })),
// //     );
// //   } else {
// //     orderBy.push({ createdAt: "desc" });
// //   }

// //   //  Get total count before pagination
// //   const total = await offerOnProductModel.countOfferOnProducts({ where });
// //   const offerOnProducts = await offerOnProductModel.findOfferOnProducts({
// //     where,
// //     skip,
// //     take: limit,
// //     orderBy,
// //     select: {
// //       id: true,
// //       name: true,
// //       sellerId: true,
// //       offerType: true,
// //       discountType: true,
// //       status: true,
// //       discountValue: true,
// //       startDate: true,
// //       endDate: true,
// //     },
// //   });
// //   return {
// //     total,
// //     page,
// //     limit,
// //     offers,
// //   };
// // };
