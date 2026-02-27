import * as reviewModel from "./review.model";

export const getProduct = async (productId: number) => {
  const product = await reviewModel.findProduct({
    where: { id: +productId },
    select: {
      id: true,
      sellerId: true,
    },
  });
  if (!product) throw new Error("Product not found");
  return product;
};

export const getOrder = async (orderId: number) => {
  const order = await reviewModel.findOrder({
    where: { id: orderId },
  });
  if (!order) throw new Error("Order not found");
  return order;
};

export const getOrderItem = async (orderItemId: number) => {
  const orderItem = await reviewModel.findOrderItem({
    where: { id: orderItemId },
  });
  if (!orderItem) throw new Error("Order item not found");
  return orderItem;
};

export const updateOrderItem = async (orderItemId: number) => {
  const orderItem = await reviewModel.updateOrderItem({
    where: { id: orderItemId },
    data: {
      isReviewed: true,
    },
  });
  if (!orderItem) throw new Error("Order item not found");
  return orderItem;
};

export const createReview = async ({
  productId,
  userId,
  orderId,
  orderItemId,
  rating,
  comment,
  images,
}: {
  productId: number;
  userId: number;
  orderId: number;
  orderItemId: number;
  rating: number;
  comment: string;
  images: string[];
}) => {
  return reviewModel.createReview({
    productId,
    userId,
    orderId,
    orderItemId,
    rating,
    comment,
    images,
  });
};

// export const deleteReview = async ({ id }: { id: number }) => {
//   const review = await reviewModel.findReview({
//     where: { id },
//   });

//   if (!review) {
//     throw new HttpError("Review not found!", 404);
//   }

//   await reviewModel.deleteReview(id);

//   return { message: "Review deleted successfully" };
// };

// export const getReview = async (query: { id: number }) => {
//   const review = await reviewModel.findReview({
//     where: {
//       id: query.id,
//     },
//     include: {
//       product: true,
//       user: {
//         select: {
//           id: true,
//           firstName: true,
//           lastName: true,
//           email: true,
//           createdAt: true,
//           role: true,
//           status: true,
//           verified: true,
//           avatar: true,
//           kyc: {
//             select: {
//               status: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!review) {
//     throw new HttpError("Review Not found!", 404);
//   }

//   return review;
// };

// export const getReviews = async (query: {
//   page?: string;
//   limit?: string;
//   userId?: string;
//   productId?: string;
// }) => {
//   const page = query.page ? Number(query.page) : 1;
//   const limit = query.limit ? Number(query.limit) : 10;
//   const skip = (page - 1) * limit;

//   const where: Prisma.ReviewWhereInput = {};

//   if (query.userId) {
//     where.userId = Number(query.userId);
//   }

//   if (query.productId) {
//     where.productId = Number(query.productId);
//   }

//   const orderBy: Prisma.ReviewOrderByWithRelationInput[] = [];
//   orderBy.push({ createdAt: "desc" });

//   const total = await reviewModel.countReviews({ where });

//   const reviews = await reviewModel.findReviews({
//     where,
//     skip,
//     take: limit,
//     orderBy,
//   });

//   return {
//     total,
//     page,
//     limit,
//     reviews,
//   };
// };
