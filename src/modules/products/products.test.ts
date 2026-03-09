// Products service unit tests
import { Prisma } from "@prisma/client";
import fs from "fs";
import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/customError";
import * as productModel from "./products.model";
import * as productService from "./products.service";

jest.mock("./products.model");
jest.mock("fs");
jest.mock("../../config/prisma", () => ({
  prisma: {
    orderItem: { count: jest.fn() },
    $transaction: jest.fn((callback) => callback(prisma)),
    additionalInfo: { deleteMany: jest.fn() },
    variant: { deleteMany: jest.fn() },
    offerOnProduct: { deleteMany: jest.fn() },
    couponOnProduct: { deleteMany: jest.fn() },
    product: { delete: jest.fn() },
  },
}));

const mockedModel = productModel as jest.Mocked<typeof productModel>;
const mockedPrisma = prisma as any;
const mockedFs = fs as unknown as jest.Mocked<typeof fs>;

describe("products.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProduct", () => {
    it("creates a product with proper type conversions", async () => {
      mockedModel.createProduct.mockResolvedValueOnce({ id: 1 } as any);
      await productService.createProduct({
        sellerId: 10,
        name: "Laptop",
        price: new Prisma.Decimal(1000),
        currency: "USD",
        sku: "L-001",
        stockQuantity: 50,
        categoryId: 1,
        subCategoryId: 1,
        childCategoryId: 1,
        hasVariants: "true",
        images: ["img1.jpg"],
        thumbnail: "thumb.jpg",
        tags: ["tech"],
        slug: "laptop",
      });

      expect(mockedModel.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          hasVariants: true,
          stockQuantity: 50,
        }),
      );
    });
  });

  describe("getProducts", () => {
    it("handles complex filters", async () => {
      mockedModel.countProducts.mockResolvedValueOnce(1);
      mockedModel.findProducts.mockResolvedValueOnce([{ id: 1 }] as any);

      const res = await productService.getProducts({
        search: "test",
        category: "1",
        priceRange: { min: "10", max: "100" },
      });

      expect(mockedModel.findProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 1,
            price: { gte: 10, lte: 100 },
          }),
        }),
      );
      expect(res.products).toHaveLength(1);
    });
  });

  describe("updateProduct", () => {
    it("throws 404 if not found", async () => {
      mockedModel.findProduct.mockResolvedValueOnce(null);
      await expect(productService.updateProduct(1, {})).rejects.toThrow(
        "Product not found",
      );
    });

    it("cleans up old thumbnail and updates images", async () => {
      mockedModel.findProduct.mockResolvedValueOnce({
        id: 1,
        thumbnail: "/public/old.jpg",
        images: ["/public/1.jpg", "/public/2.jpg"],
      } as any);
      mockedModel.updateProduct.mockResolvedValueOnce({ id: 1 } as any);

      (mockedFs.access as any).mockImplementation((p: any, m: any, cb: any) =>
        cb(null),
      );
      (mockedFs.unlink as any).mockImplementation((p: any, cb: any) =>
        cb(null),
      );

      await productService.updateProduct(1, {
        thumbnail: "new.jpg",
        imagesToRemove: ["/public/1.jpg"],
        images: ["3.jpg"],
      });

      expect(mockedFs.unlink).toHaveBeenCalled(); // for thumbnail and imagesToRemove
      expect(mockedModel.updateProduct).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          images: ["/public/2.jpg", "3.jpg"],
        }),
      );
    });
  });

  describe("deleteProduct", () => {
    it("throws 404 if not found", async () => {
      mockedModel.findProduct.mockResolvedValueOnce(null);
      await expect(
        productService.deleteProduct({ id: 1, role: "admin", authId: 99 }),
      ).rejects.toEqual(new HttpError("Product not found!", 404));
    });

    it("blocks if active orders exist", async () => {
      mockedModel.findProduct.mockResolvedValueOnce({ id: 1 } as any);
      mockedPrisma.orderItem.count.mockResolvedValueOnce(1);
      await expect(
        productService.deleteProduct({ id: 1, role: "admin", authId: 99 }),
      ).rejects.toEqual(
        new HttpError(
          "Cannot delete product with active orders. Please resolve orders first.",
          400,
        ),
      );
    });

    it("soft deletes (draft) if previous orders exist", async () => {
      mockedModel.findProduct.mockResolvedValueOnce({
        id: 1,
        sellerId: 10,
      } as any);
      mockedPrisma.orderItem.count
        .mockResolvedValueOnce(0) // active
        .mockResolvedValueOnce(5); // total

      mockedModel.updateProduct.mockResolvedValueOnce({
        id: 1,
        status: "draft",
      } as any);

      await productService.deleteProduct({ id: 1, role: "seller", authId: 10 });
      expect(mockedModel.updateProduct).toHaveBeenCalledWith(1, {
        status: "draft",
      });
    });

    it("hard deletes with dependencies if no orders exist", async () => {
      mockedModel.findProduct.mockResolvedValueOnce({
        id: 1,
        sellerId: 10,
      } as any);
      mockedPrisma.orderItem.count.mockResolvedValue(0);

      await productService.deleteProduct({ id: 1, role: "admin", authId: 99 });

      expect(mockedPrisma.$transaction).toHaveBeenCalled();
      expect(mockedPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
