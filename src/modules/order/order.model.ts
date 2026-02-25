import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const createOrder = async (
  data: Prisma.OrdersCreateInput,
  items: {
    productId: number;
    variantId?: number;
    quantity: number;
    price: number;
    total: number;
  }[],
  userId: number,
) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Create the order
    const order = await tx.orders.create({
      data: {
        ...data,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: new Prisma.Decimal(item.price),
            total: new Prisma.Decimal(item.total),
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // 2. Clear the cart
    await tx.cart.deleteMany({
      where: { userId },
    });

    return order;
  });
};

export const findOrders = async (query: Prisma.OrdersFindManyArgs) => {
  return prisma.orders.findMany(query);
};

export const findOrderById = async (id: number, userId?: number) => {
  return prisma.orders.findFirst({
    where: {
      id,
      ...(userId && { userId }),
    },
    include: {
      orderItems: {
        include: {
          product: true,
          variant: true,
        },
      },
      deliveryAddress: true,
      pickupAddress: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
};

export const updateOrder = async (
  id: number,
  data: Prisma.OrdersUpdateInput,
) => {
  return prisma.orders.update({
    where: { id },
    data,
  });
};

export const countOrders = async (query: Prisma.OrdersCountArgs) => {
  return prisma.orders.count(query);
};

export const findOrderItem = async (query: Prisma.OrderItemFindManyArgs) => {
  return prisma.orderItem.findMany(query);
};
