import { OrderStatus, Prisma, ReturnStatus } from "@prisma/client";

import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/customError";
import { generateOrderNumber } from "../../utils/helpers";

export const createOrder = async (
  userId: number,
  data: {
    deliveryAddressId: number;
    pickupAddressId: number;
    paymentMethod: any;
    couponCode?: string;
    notes?: string;
    items: {
      productId: number;
      variantId?: number;
      quantity: number;
    }[];
  },
) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    let subTotal = 0;
    const orderItemsData = [];

    // 0. Validate Addresses
    const deliveryId = Number(data.deliveryAddressId);
    const pickupId = Number(data.pickupAddressId);

    // Validate Delivery Address (Must belong to customer)
    const deliveryAddress = await tx.address.findFirst({
      where: { id: deliveryId, userId: Number(userId), status: true },
    });
    if (!deliveryAddress) {
      throw new HttpError(
        `Delivery address ${deliveryId} not found or does not belong to you`,
        404,
      );
    }

    // Validate Pickup Address (Just exists and active)
    const pickupAddress = await tx.address.findFirst({
      where: { id: pickupId, status: true },
    });
    if (!pickupAddress) {
      throw new HttpError(`Pickup address ${pickupId} not found`, 404);
    }

    // 1. Validate Items & Apply Offers
    for (const item of data.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: item.variantId
            ? {
                where: { id: item.variantId },
                include: {
                  OfferOnVariant: {
                    where: {
                      offer: {
                        status: "active",
                        startDate: { lte: new Date() },
                        endDate: { gte: new Date() },
                      },
                    },
                    include: { offer: true },
                  },
                },
              }
            : false,
          offers: {
            where: {
              offer: {
                status: "active",
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
              },
            },
            include: { offer: true },
          },
        },
      });

      if (!product)
        throw new HttpError(`Product ${item.productId} not found`, 404);

      // Security: Seller cannot buy own product
      if (product.sellerId === userId) {
        throw new HttpError(
          `You cannot purchase your own product: ${product.name}`,
          403,
        );
      }

      let price = Number(product.price);
      if (item.variantId) {
        const variant = product.variants[0];
        if (!variant)
          throw new HttpError(`Variant ${item.variantId} not found`, 404);
        price = Number(variant.price);
      }

      // Check Stock
      const stock = item.variantId
        ? product.variants[0].stockQuantity
        : product.stockQuantity;
      if (stock < item.quantity) {
        throw new HttpError(`Insufficient stock for ${product.name}`, 400);
      }

      // Apply Offer (Pick the best one)
      let discountAmount = 0;
      const allOffers = [...product.offers.map((o) => o.offer)];

      if (item.variantId && product.variants[0]) {
        const variant = product.variants[0] as any;
        if (variant.OfferOnVariant) {
          const variantOffers = variant.OfferOnVariant.map((o: any) => o.offer);
          allOffers.push(...variantOffers);
        }
      }

      for (const offer of allOffers) {
        let currentDiscount = 0;
        if (offer.discountType === "percentage") {
          currentDiscount = (price * Number(offer.discountValue)) / 100;
        } else {
          currentDiscount = Number(offer.discountValue);
        }
        if (currentDiscount > discountAmount) {
          discountAmount = currentDiscount;
        }
      }

      const finalPrice = Math.max(0, price - discountAmount);
      const itemTotal = finalPrice * item.quantity;
      subTotal += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: finalPrice,
        total: itemTotal,
      });

      // Update Stock
      if (item.variantId) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: {
            stockQuantity: { decrement: item.quantity },
            soldQuantity: { increment: item.quantity },
          },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
            soldQuantity: { increment: item.quantity },
          },
        });
      }
    }

    // 2. Validate Coupon
    let discountAmount = 0;
    let couponId: number | null = null;
    if (data.couponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { code: data.couponCode },
        include: {
          products: true,
          variants: true,
        },
      });

      if (!coupon) throw new HttpError("Invalid coupon code", 400);
      if (
        coupon.startDate > new Date() ||
        (coupon.endDate && coupon.endDate < new Date())
      ) {
        throw new HttpError("Coupon has expired", 400);
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new HttpError("Coupon usage limit reached", 400);
      }

      // Check if user already used this coupon
      const usage = await tx.couponUsage.findUnique({
        where: { couponId_userId: { couponId: coupon.id, userId } },
      });
      if (usage) throw new HttpError("You have already used this coupon", 400);

      // Apply Coupon Discount
      if (coupon.discountType === "percentage") {
        discountAmount = (subTotal * Number(coupon.discountValue)) / 100;
      } else {
        discountAmount = Number(coupon.discountValue);
      }
      discountAmount = Math.min(discountAmount, subTotal);
      couponId = coupon.id;

      // Increment Coupon usage
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
      await tx.couponUsage.create({
        data: { couponId: coupon.id, userId },
      });
    }

    const shippingFee = 50; // Flat fee example
    const totalAmount = subTotal - discountAmount + shippingFee;

    // 3. Create Order
    const orderNumber = generateOrderNumber();
    const order = await tx.orders.create({
      data: {
        orderNumber,
        userId,
        deliveryAddressId: data.deliveryAddressId,
        pickupAddressId: data.pickupAddressId,
        paymentMethod: data.paymentMethod,
        subTotal: new Prisma.Decimal(subTotal),
        discountAmount: new Prisma.Decimal(discountAmount),
        shippingFee: new Prisma.Decimal(shippingFee),
        totalAmount: new Prisma.Decimal(totalAmount),
        couponId,
        notes: data.notes,
        orderItems: {
          create: orderItemsData.map((item) => ({
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

    // 4. Clear Cart
    await tx.cart.deleteMany({
      where: { userId },
    });

    return order;
  });
};

export const getOrders = async (userId: number, role: string, query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.OrdersWhereInput = {};
  if (role === "user") {
    where.userId = userId;
  } else if (role === "seller") {
    where.orderItems = {
      some: {
        product: { sellerId: userId },
      },
    };
  }

  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    }),
    prisma.orders.count({ where }),
  ]);

  return { orders, total, page, limit };
};

export const getOrderById = async (
  id: number,
  userId: number,
  role: string,
) => {
  const order = await prisma.orders.findUnique({
    where: { id },
    include: {
      orderItems: { include: { product: true, variant: true } },
      deliveryAddress: true,
      pickupAddress: true,
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!order) throw new HttpError("Order not found", 404);

  if (role === "user" && order.userId !== userId) {
    throw new HttpError("Access denied", 403);
  }

  if (role === "seller") {
    const sellerItems = order.orderItems.filter(
      (item: any) => item.product.sellerId === userId,
    );
    if (sellerItems.length === 0) throw new HttpError("Access denied", 403);
  }

  return order;
};

export const updateOrderStatus = async (
  id: number,
  status: OrderStatus,
  userId: number,
  role: string,
) => {
  const order = await prisma.orders.findUnique({
    where: { id },
    include: { orderItems: { include: { product: true } } },
  });

  if (!order) throw new HttpError("Order not found", 404);

  if (role !== "admin" && role !== "seller") {
    throw new HttpError(
      "Only admins and sellers can update order status.",
      403,
    );
  }

  if (role === "seller") {
    const isSellerProduct = order.orderItems.some(
      (item: any) => item.product.sellerId === userId,
    );
    if (!isSellerProduct) throw new HttpError("Access denied", 403);
  }

  return prisma.orders.update({
    where: { id },
    data: {
      status,
      ...(status === "delivered" && { deliveredAt: new Date() }),
      ...(status === "processing" && { processingAt: new Date() }),
      ...(status === "shipped" && { shippedAt: new Date() }),
      ...(status === "cancelled" && { cancelledAt: new Date() }),
    },
  });
};

export const updateOrderItemStatus = async (
  id: number,
  status: OrderStatus,
  userId: number,
  role: string,
) => {
  const item = await prisma.orderItem.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!item) throw new HttpError("Order item not found", 404);

  if (role !== "admin" && role !== "seller") {
    throw new HttpError(
      "Only admins and sellers can update order items status.",
      403,
    );
  }

  if (role === "seller") {
    if (item.product.sellerId !== userId) {
      throw new HttpError("Access denied", 403);
    }
  }

  return prisma.orderItem.update({
    where: { id },
    data: {
      status,
      ...(status === "pickup" && { pickupAt: new Date() }),
      ...(status === "delivered" && { deliveredAt: new Date() }),
      ...(status === "processing" && { processingAt: new Date() }),
      ...(status === "shipped" && { shippedAt: new Date() }),
      ...(status === "cancelled" && { cancelledAt: new Date() }),
    },
  });
};

export const cancelOrder = async (
  id: number,
  userId: number,
  reason?: string,
) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const order = await tx.orders.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) throw new HttpError("Order not found", 404);
    if (order.userId !== userId) throw new HttpError("Access denied", 403);
    if (order.status !== "pending") {
      throw new HttpError("Only pending orders can be cancelled", 400);
    }

    // Restore stock
    for (const item of order.orderItems) {
      if (item.variantId) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    }

    return tx.orders.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
        notes: reason
          ? `${order.notes || ""}\nCancel Reason: ${reason}`
          : order.notes,
      },
    });
  });
};

export const returnOrder = async (
  id: number,
  userId: number,
  data: { orderItemId: number; reason: string; images?: string[] },
) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const order = await tx.orders.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) throw new HttpError("Order not found", 404);
    if (order.userId !== userId) throw new HttpError("Access denied", 403);
    if (order.status !== "delivered") {
      throw new HttpError("Only delivered orders can be returned", 400);
    }

    const orderItem = order.orderItems.find(
      (item) => item.id === Number(data.orderItemId),
    );
    if (!orderItem) throw new HttpError("Order item not found", 404);

    const returnRecord = await tx.returnOrder.create({
      data: {
        orderId: id,
        orderItemId: data.orderItemId,
        reason: data.reason,
        images: (data.images as any) || [],
        status: "pending",
      } as any,
    });

    return returnRecord;
  });
};

export const getReturnOrders = async (
  userId: number,
  role: string,
  query: any,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ReturnOrderWhereInput = {};
  if (role === "user") {
    where.order = { userId };
  } else if (role === "seller") {
    where.orderItem = {
      product: { sellerId: userId },
    };
  }

  const [returns, total] = await Promise.all([
    prisma.returnOrder.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        order: true,
        orderItem: { include: { product: true } },
      },
    }),
    prisma.returnOrder.count({ where }),
  ]);

  return { returns, total, page, limit };
};

export const updateReturnStatus = async (
  id: number,
  status: ReturnStatus,
  userId: number,
  role: string,
) => {
  const returnOrder = await prisma.returnOrder.findUnique({
    where: { id },
    include: { orderItem: { include: { product: true } } },
  });

  if (!returnOrder) throw new HttpError("Return request not found", 404);

  if (role !== "admin" && role !== "seller") {
    throw new HttpError(
      "Only admins and sellers can update return status.",
      403,
    );
  }

  if (role === "seller") {
    if (returnOrder.orderItem.product.sellerId !== userId) {
      throw new HttpError("Access denied", 403);
    }
  }

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updatedReturn = await tx.returnOrder.update({
      where: { id },
      data: { status },
    });

    // If approved or returned, update the OrderItem status
    if (status === "approved" || status === "returned") {
      await tx.orderItem.update({
        where: { id: returnOrder.orderItemId },
        data: { status: "returned" },
      });

      // Restore stock
      if (returnOrder.orderItem.variantId) {
        await tx.variant.update({
          where: { id: returnOrder.orderItem.variantId },
          data: {
            stockQuantity: { increment: returnOrder.orderItem.quantity },
          },
        });
      } else {
        await tx.product.update({
          where: { id: returnOrder.orderItem.productId },
          data: {
            stockQuantity: { increment: returnOrder.orderItem.quantity },
          },
        });
      }
    }

    return updatedReturn;
  });
};
