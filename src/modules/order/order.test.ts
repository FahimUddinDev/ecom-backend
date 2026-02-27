import { prisma } from "../../config/prisma";
import * as orderService from "./order.service";

jest.mock("../../config/prisma", () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(prisma)),
    address: { findFirst: jest.fn() },
    product: { findUnique: jest.fn(), update: jest.fn() },
    variant: { update: jest.fn() },
    coupon: { findUnique: jest.fn(), update: jest.fn() },
    couponUsage: { findUnique: jest.fn(), create: jest.fn() },
    orders: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    orderItem: { update: jest.fn() },
    cart: { deleteMany: jest.fn() },
    returnOrder: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("Order Service Enhancements", () => {
  const userId = 1;
  const mockAddress = { id: 10, userId, status: true };
  const mockProduct = {
    id: 101,
    sellerId: 99,
    name: "Test Product",
    price: 100,
    stockQuantity: 10,
    offers: [
      {
        offer: {
          discountType: "percentage",
          discountValue: 10,
          status: "active",
        },
      },
    ],
    variants: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder Offer Logic", () => {
    it("applies the best offer between product and variant", async () => {
      const variantId = 201;
      const productWithVariantBestOffer = {
        ...mockProduct,
        variants: [
          {
            id: variantId,
            price: 100,
            stockQuantity: 5,
            OfferOnVariant: [
              {
                offer: {
                  discountType: "fixed",
                  discountValue: 20, // Better than 10% (10)
                  status: "active",
                },
              },
            ],
          },
        ],
      };

      (prisma.address.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockAddress) // Delivery
        .mockResolvedValueOnce({ ...mockAddress, id: 11 }); // Pickup

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(
        productWithVariantBestOffer,
      );

      (prisma.orders.create as jest.Mock).mockResolvedValue({ id: 1 });

      const orderData = {
        deliveryAddressId: 10,
        pickupAddressId: 11,
        paymentMethod: "cash_on_delivery",
        items: [{ productId: 101, variantId, quantity: 1 }],
      };

      await orderService.createOrder(userId, orderData);

      expect(prisma.orders.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subTotal: expect.objectContaining({
              d: expect.arrayContaining([80]),
            }), // 100 - 20
          }),
        }),
      );
    });
  });

  describe("updateReturnStatus Stock Maintenance", () => {
    it("restores stock when return is approved", async () => {
      const mockReturnOrder = {
        id: 5,
        orderItemId: 50,
        orderItem: {
          productId: 101,
          variantId: 201,
          quantity: 2,
        },
      };

      (prisma.returnOrder.findUnique as jest.Mock).mockResolvedValue(
        mockReturnOrder,
      );
      (prisma.returnOrder.update as jest.Mock).mockResolvedValue({
        ...mockReturnOrder,
        status: "approved",
      });

      await orderService.updateReturnStatus(5, "approved", 99, "admin");

      expect(prisma.variant.update).toHaveBeenCalledWith({
        where: { id: 201 },
        data: { stockQuantity: { increment: 2 } },
      });
      expect(prisma.orderItem.update).toHaveBeenCalledWith({
        where: { id: 50 },
        data: { status: "returned" },
      });
    });
  });
});
