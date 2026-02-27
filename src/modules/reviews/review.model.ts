import { OrderItem, Orders, Prisma, Product, Review } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findProduct = async (
  query: Prisma.ProductFindUniqueArgs,
): Promise<Product | null> => {
  return prisma.product.findUnique(query);
};

export const findOrder = async (
  query: Prisma.OrdersFindUniqueArgs,
): Promise<Orders | null> => {
  return prisma.orders.findFirst(query);
};
export const findOrderItem = async (
  query: Prisma.OrderItemFindUniqueArgs,
): Promise<OrderItem | null> => {
  return prisma.orderItem.findFirst(query);
};

export const updateOrderItem = async (
  query: Prisma.OrderItemUpdateArgs,
): Promise<OrderItem> => {
  return prisma.orderItem.update(query);
};

export const createReview = async (data: {
  productId: number;
  userId: number;
  orderId: number;
  orderItemId: number;
  rating: number;
  comment: string;
  images: string[];
}): Promise<Review> => {
  const { productId, userId, orderId, orderItemId, rating, comment, images } =
    data;

  const prismaData: Prisma.ReviewCreateInput = {
    user: { connect: { id: userId } },
    product: { connect: { id: productId } },
    order: { connect: { id: orderId } },
    orderItem: { connect: { id: orderItemId } },
    rating,
    comment,
    images,
  };

  return prisma.review.create({
    data: prismaData,
    include: {
      order: true,
      orderItem: true,
      product: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          role: true,
          status: true,
          verified: true,
          avatar: true,
          kyc: {
            select: {
              status: true,
            },
          },
        },
      },
    },
  });
};

// export const updateReview = async (
//   id: number,
//   data: Prisma.ReviewUpdateInput,
// ): Promise<Review> => {
//   return prisma.review.update({
//     where: { id },
//     data,
//   });
// };

// export const deleteReview = async (id: number): Promise<Review> => {
//   return prisma.review.delete({
//     where: { id },
//   });
// };

// export const findReview = async (
//   query: Prisma.ReviewFindUniqueArgs,
// ): Promise<Review | null> => {
//   return prisma.review.findUnique(query);
// };

// export const findReviews = async (
//   query: Prisma.ReviewFindManyArgs,
// ): Promise<Review[]> => {
//   return prisma.review.findMany({
//     ...query,
//     include: {
//       order: true,
//       orderItem: true,
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
// };

// export const countReviews = async (
//   query: Prisma.ReviewCountArgs,
// ): Promise<number> => {
//   return prisma.review.count(query);
// };
