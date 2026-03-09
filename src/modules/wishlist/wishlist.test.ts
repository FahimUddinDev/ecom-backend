// Wishlist service unit tests
import { HttpError } from "../../utils/customError";
import * as wishlistModel from "./wishlist.model";
import * as wishlistService from "./wishlist.service";

jest.mock("./wishlist.model");

const mockedModel = wishlistModel as jest.Mocked<typeof wishlistModel>;

describe("wishlist.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProduct", () => {
    it("returns product when found", async () => {
      mockedModel.findProduct.mockResolvedValueOnce({
        id: 1,
        sellerId: 10,
      } as any);
      const res = await wishlistService.getProduct(1);
      expect(res.id).toBe(1);
    });

    it("throws if product not found", async () => {
      mockedModel.findProduct.mockResolvedValueOnce(null);
      await expect(wishlistService.getProduct(99)).rejects.toThrow(
        "Product not found",
      );
    });
  });

  describe("createWishlist", () => {
    it("creates a wishlist entry", async () => {
      mockedModel.createWishlist.mockResolvedValueOnce({ id: 1 } as any);
      const res = await wishlistService.createWishlist({
        productId: 10,
        userId: 5,
      });
      expect(mockedModel.createWishlist).toHaveBeenCalledWith({
        productId: 10,
        userId: 5,
      });
      expect(res.id).toBe(1);
    });
  });

  describe("deleteWishlist", () => {
    it("throws 404 if not found", async () => {
      mockedModel.findWishlist.mockResolvedValueOnce(null);
      await expect(wishlistService.deleteWishlist({ id: 99 })).rejects.toEqual(
        new HttpError("Wishlist not found!", 404),
      );
    });

    it("deletes the wishlist entry", async () => {
      mockedModel.findWishlist.mockResolvedValueOnce({ id: 1 } as any);
      const res = await wishlistService.deleteWishlist({ id: 1 });
      expect(mockedModel.deleteWishlist).toHaveBeenCalledWith(1);
      expect(res.message).toBe("Wishlist deleted successfully");
    });
  });

  describe("getWishlist", () => {
    it("throws 404 if not found", async () => {
      mockedModel.findWishlist.mockResolvedValueOnce(null);
      await expect(wishlistService.getWishlist({ id: 99 })).rejects.toEqual(
        new HttpError("Wishlist Not found!", 404),
      );
    });

    it("returns wishlist with includes", async () => {
      mockedModel.findWishlist.mockResolvedValueOnce({ id: 1 } as any);
      const res = await wishlistService.getWishlist({ id: 1 });
      expect(res.id).toBe(1);
    });
  });

  describe("getWishlists", () => {
    it("returns paginated data", async () => {
      mockedModel.countWishlists.mockResolvedValueOnce(1);
      mockedModel.findWishlists.mockResolvedValueOnce([{ id: 10 }] as any);
      const res = await wishlistService.getWishlists({ userId: "5" });
      expect(res.wishlists).toHaveLength(1);
      expect(mockedModel.findWishlists).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 5 },
        }),
      );
    });
  });
});
