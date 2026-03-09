// Cart service unit tests
import { HttpError } from "../../utils/customError";
import * as cartModel from "./cart.model";
import * as cartService from "./cart.service";

jest.mock("./cart.model");

const mockedCartModel = cartModel as jest.Mocked<typeof cartModel>;

describe("cart.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProduct", () => {
    it("returns product when found", async () => {
      mockedCartModel.findProduct.mockResolvedValueOnce({
        id: 1,
        sellerId: 10,
      } as any);
      const res = await cartService.getProduct(1);
      expect(res.id).toBe(1);
    });

    it("throws 404 if product not found", async () => {
      mockedCartModel.findProduct.mockResolvedValueOnce(null);
      await expect(cartService.getProduct(99)).rejects.toEqual(
        new HttpError("Product not found", 404),
      );
    });
  });

  describe("createCart", () => {
    it("creates a new cart entry if it doesn't exist", async () => {
      mockedCartModel.findCart.mockResolvedValueOnce(null);
      mockedCartModel.createCart.mockResolvedValueOnce({ id: 1 } as any);

      await cartService.createCart({ productId: 1, userId: 10, quantity: 2 });

      expect(mockedCartModel.createCart).toHaveBeenCalledWith({
        productId: 1,
        userId: 10,
        variantId: undefined,
        quantity: 2,
      });
    });

    it("updates existing cart entry quantity", async () => {
      mockedCartModel.findCart.mockResolvedValueOnce({
        id: 1,
        quantity: 2,
      } as any);
      mockedCartModel.updateCart.mockResolvedValueOnce({
        id: 1,
        quantity: 5,
      } as any);

      const res = await cartService.createCart({
        productId: 1,
        userId: 10,
        quantity: 3,
      });

      expect(mockedCartModel.updateCart).toHaveBeenCalledWith(1, 5);
      expect(res.quantity).toBe(5);
    });
  });

  describe("updateCartItem", () => {
    it("throws 404 if item not found", async () => {
      mockedCartModel.findCart.mockResolvedValueOnce(null);
      await expect(
        cartService.updateCartItem({ id: 1, quantity: 5 }),
      ).rejects.toEqual(new HttpError("Cart item not found!", 404));
    });

    it("updates item quantity", async () => {
      mockedCartModel.findCart.mockResolvedValueOnce({ id: 1 } as any);
      mockedCartModel.updateCart.mockResolvedValueOnce({
        id: 1,
        quantity: 10,
      } as any);
      const res = await cartService.updateCartItem({ id: 1, quantity: 10 });
      expect(res.quantity).toBe(10);
    });
  });

  describe("deleteCartItem", () => {
    it("throws 404 if not found", async () => {
      mockedCartModel.findCart.mockResolvedValueOnce(null);
      await expect(cartService.deleteCartItem({ id: 1 })).rejects.toEqual(
        new HttpError("Cart item not found!", 404),
      );
    });

    it("deletes item", async () => {
      mockedCartModel.findCart.mockResolvedValueOnce({ id: 1 } as any);
      await cartService.deleteCartItem({ id: 1 });
      expect(mockedCartModel.deleteCart).toHaveBeenCalledWith(1);
    });
  });

  describe("getCartItems", () => {
    it("returns paginated data", async () => {
      mockedCartModel.countCarts.mockResolvedValueOnce(1);
      mockedCartModel.findCarts.mockResolvedValueOnce([{ id: 1 }] as any);
      const res = await cartService.getCartItems({ userId: "10" });
      expect(res.total).toBe(1);
      expect(res.carts).toHaveLength(1);
    });
  });

  describe("createCarts (Bulk)", () => {
    it("throws 404 if any product missing", async () => {
      mockedCartModel.findProduct.mockResolvedValueOnce(null);
      await expect(
        cartService.createCarts({
          userId: 1,
          items: [{ productId: 9, quantity: 1 }],
        }),
      ).rejects.toEqual(new HttpError("Product 9 not found", 404));
    });

    it("throws 400 if user adds own product", async () => {
      mockedCartModel.findProduct.mockResolvedValueOnce({
        id: 1,
        sellerId: 5,
      } as any);
      await expect(
        cartService.createCarts({
          userId: 5,
          items: [{ productId: 1, quantity: 1 }],
        }),
      ).rejects.toEqual(
        new HttpError("You can't add your own product (id: 1) to cart", 400),
      );
    });

    it("creates multiple items", async () => {
      mockedCartModel.findProduct.mockResolvedValue({
        id: 1,
        sellerId: 99,
      } as any);
      mockedCartModel.createManyCarts.mockResolvedValueOnce([
        { id: 10 },
        { id: 11 },
      ] as any);

      const res = await cartService.createCarts({
        userId: 1,
        items: [{ productId: 1, quantity: 2 }],
      });
      expect(res).toHaveLength(2);
    });
  });

  describe("deleteCartItems (Bulk)", () => {
    it("throws 403 if user doesn't own an item", async () => {
      mockedCartModel.findCarts.mockResolvedValueOnce([
        { id: 1, userId: 1 },
        { id: 2, userId: 2 },
      ] as any);
      await expect(
        cartService.deleteCartItems({ ids: [1, 2], userId: 1 }),
      ).rejects.toEqual(
        new HttpError("You don't own one or more of these cart items", 403),
      );
    });

    it("deletes multiple items", async () => {
      mockedCartModel.findCarts.mockResolvedValueOnce([
        { id: 1, userId: 1 },
      ] as any);
      await cartService.deleteCartItems({ ids: [1], userId: 1 });
      expect(mockedCartModel.deleteManyCarts).toHaveBeenCalledWith([1]);
    });
  });

  describe("clearCart", () => {
    it("clears user cart", async () => {
      mockedCartModel.clearUserCart.mockResolvedValueOnce({ count: 5 } as any);
      const res = await cartService.clearCart({ userId: 1 });
      expect(res.deleted).toBe(5);
    });
  });
});
