// Comments service unit tests
import { HttpError } from "../../utils/customError";
import * as commentsModel from "./comments.model";
import * as commentsService from "./comments.service";

jest.mock("./comments.model", () => {
  const originalModule = jest.requireActual("./comments.model");
  return {
    ...originalModule,
    findComment: jest.fn(),
    findComments: jest.fn(),
    createComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
    countComments: jest.fn(),
    prisma: {
      product: {
        findUnique: jest.fn(),
      },
    },
  };
});

const mockedModel = commentsModel as jest.Mocked<typeof commentsModel> & {
  prisma: any;
};

describe("comments.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createComment", () => {
    it("creates an anonymous top-level comment", async () => {
      mockedModel.createComment.mockResolvedValueOnce({ id: 1 } as any);
      await commentsService.createComment({ productId: 10, content: "Great!" });
      expect(mockedModel.createComment).toHaveBeenCalledWith(
        expect.objectContaining({
          product: { connect: { id: 10 } },
          content: "Great!",
        }),
      );
    });

    it("creates a reply from a registered user", async () => {
      mockedModel.createComment.mockResolvedValueOnce({ id: 2 } as any);
      await commentsService.createComment({
        productId: 10,
        userId: 5,
        content: "Reply",
        parentId: 1,
      });
      expect(mockedModel.createComment).toHaveBeenCalledWith(
        expect.objectContaining({
          user: { connect: { id: 5 } },
          parent: { connect: { id: 1 } },
        }),
      );
    });
  });

  describe("getComment", () => {
    it("throws 404 if not found", async () => {
      mockedModel.findComment.mockResolvedValueOnce(null);
      await expect(commentsService.getComment(99)).rejects.toEqual(
        new HttpError("Comment not found!", 404),
      );
    });

    it("returns comment when found", async () => {
      mockedModel.findComment.mockResolvedValueOnce({ id: 1 } as any);
      const res = await commentsService.getComment(1);
      expect(res.id).toBe(1);
    });
  });

  describe("getComments", () => {
    it("returns paginated comments, filtering for top-level only", async () => {
      mockedModel.countComments.mockResolvedValueOnce(1);
      mockedModel.findComments.mockResolvedValueOnce([{ id: 1 }] as any);

      const res = await commentsService.getComments({ productId: "10" });

      expect(mockedModel.findComments).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentId: null, productId: 10 },
        }),
      );
      expect(res.comments).toHaveLength(1);
    });
  });

  describe("getProductSeller", () => {
    it("returns sellerId for a product", async () => {
      mockedModel.prisma.product.findUnique.mockResolvedValueOnce({
        sellerId: 88,
      });
      const res = await commentsService.getProductSeller(10);
      expect(res).toBe(88);
    });

    it("returns undefined if product not found", async () => {
      mockedModel.prisma.product.findUnique.mockResolvedValueOnce(null);
      const res = await commentsService.getProductSeller(99);
      expect(res).toBeUndefined();
    });
  });
});
