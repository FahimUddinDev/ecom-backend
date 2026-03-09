// Review service unit tests
import { HttpError } from "../../utils/customError";
import * as reviewModel from "./review.model";
import * as reviewService from "./review.service";

jest.mock("./review.model");

const mockedModel = reviewModel as jest.Mocked<typeof reviewModel>;

describe("review.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProduct", () => {
    it("returns product when found", async () => {
      mockedModel.findProduct.mockResolvedValueOnce({
        id: 1,
        sellerId: 10,
      } as any);
      const res = await reviewService.getProduct(1);
      expect(res.id).toBe(1);
    });

    it("throws if product not found", async () => {
      mockedModel.findProduct.mockResolvedValueOnce(null);
      await expect(reviewService.getProduct(99)).rejects.toThrow(
        "Product not found",
      );
    });
  });

  describe("createReview", () => {
    it("creates a review with all fields", async () => {
      const reviewData = {
        productId: 1,
        userId: 1,
        orderId: 1,
        orderItemId: 1,
        rating: 5,
        comment: "Excellent",
        images: ["img1.jpg"],
      };
      mockedModel.createReview.mockResolvedValueOnce({
        id: 10,
        ...reviewData,
      } as any);

      const res = await reviewService.createReview(reviewData);
      expect(mockedModel.createReview).toHaveBeenCalledWith(reviewData);
      expect(res.id).toBe(10);
    });
  });

  describe("getReview", () => {
    it("throws 404 if not found", async () => {
      mockedModel.findReview.mockResolvedValueOnce(null);
      await expect(reviewService.getReview({ id: 99 })).rejects.toEqual(
        new HttpError("Review Not found!", 404),
      );
    });

    it("returns review with includes", async () => {
      mockedModel.findReview.mockResolvedValueOnce({
        id: 1,
        comment: "test",
      } as any);
      const res = await reviewService.getReview({ id: 1 });
      expect(res.id).toBe(1);
    });
  });

  describe("getReviews", () => {
    it("returns paginated and filtered reviews", async () => {
      mockedModel.countReviews.mockResolvedValueOnce(1);
      mockedModel.findReviews.mockResolvedValueOnce([{ id: 10 }] as any);

      const res = await reviewService.getReviews({ productId: "5" });

      expect(mockedModel.findReviews).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productId: 5 },
          orderBy: [{ createdAt: "desc" }],
        }),
      );
      expect(res.reviews).toHaveLength(1);
    });
  });

  describe("updateOrderItem", () => {
    it("updates isReviewed to true", async () => {
      mockedModel.updateOrderItem.mockResolvedValueOnce({
        id: 1,
        isReviewed: true,
      } as any);
      await reviewService.updateOrderItem(1);
      expect(mockedModel.updateOrderItem).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isReviewed: true },
      });
    });
  });

  describe("deleteReview", () => {
    it("deletes the review", async () => {
      mockedModel.deleteReview.mockResolvedValueOnce({ id: 1 } as any);
      const res = await reviewService.deleteReview(1);
      expect(mockedModel.deleteReview).toHaveBeenCalledWith(1);
      expect(res.message).toBe("Review deleted successfully");
    });
  });
});
