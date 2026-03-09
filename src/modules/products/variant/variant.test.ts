// Variant service unit tests
import { Prisma } from "@prisma/client";
import fs from "fs";
import { prisma } from "../../../config/prisma";
import { HttpError } from "../../../utils/customError";
import * as variantModel from "./variant.model";
import * as variantService from "./variant.service";

jest.mock("./variant.model");
jest.mock("fs");
jest.mock("../../../config/prisma", () => ({
  prisma: {
    orderItem: { count: jest.fn() },
    $transaction: jest.fn((callback) => callback(prisma)),
    offerOnVariant: { deleteMany: jest.fn() },
    couponOnVariant: { deleteMany: jest.fn() },
    variant: { delete: jest.fn() },
  },
}));

const mockedModel = variantModel as jest.Mocked<typeof variantModel>;
const mockedPrisma = prisma as any;
const mockedFs = fs as unknown as jest.Mocked<typeof fs>;

describe("variant.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createVariant", () => {
    it("creates a variant successfully", async () => {
      mockedModel.createVariant.mockResolvedValueOnce({ id: 1 } as any);
      await variantService.createVariant({
        productId: 10,
        sellerId: 5,
        name: "XL / Blue",
        price: new Prisma.Decimal(50),
        currency: "USD",
        sku: "XL-B-10",
        stockQuantity: 100,
        images: ["v1.jpg"],
        thumbnail: "vt.jpg",
        type: "size/color",
      });

      expect(mockedModel.createVariant).toHaveBeenCalledWith(
        expect.objectContaining({
          stockQuantity: 100,
          name: "XL / Blue",
        }),
      );
    });
  });

  describe("updateVariant", () => {
    it("throws 404 if variant missing", async () => {
      mockedModel.findVariant.mockResolvedValueOnce(null);
      await expect(variantService.updateVariant(1, {})).rejects.toThrow(
        "Variant not found",
      );
    });

    it("cleans up old files and updates variant", async () => {
      mockedModel.findVariant.mockResolvedValueOnce({
        id: 1,
        thumbnail: "/public/vold.jpg",
        images: ["/public/v1.jpg"],
      } as any);
      mockedModel.updateVariant.mockResolvedValueOnce({ id: 1 } as any);

      (mockedFs.access as any).mockImplementation((p: any, m: any, cb: any) =>
        cb(null),
      );
      (mockedFs.unlink as any).mockImplementation((p: any, cb: any) =>
        cb(null),
      );

      await variantService.updateVariant(1, {
        thumbnail: "vnew.jpg",
        imagesToRemove: ["/public/v1.jpg"],
        images: ["v2.jpg"],
      });

      expect(mockedFs.unlink).toHaveBeenCalled();
      expect(mockedModel.updateVariant).toHaveBeenCalled();
    });
  });

  describe("deleteVariant", () => {
    it("throws 404 if not found", async () => {
      mockedModel.findVariant.mockResolvedValueOnce(null);
      await expect(
        variantService.deleteVariant({ id: 1, role: "admin", authId: 99 }),
      ).rejects.toEqual(new HttpError("Variant not found!", 404));
    });

    it("blocks if active orders exist", async () => {
      mockedModel.findVariant.mockResolvedValueOnce({ id: 1 } as any);
      mockedPrisma.orderItem.count.mockResolvedValueOnce(1);
      await expect(
        variantService.deleteVariant({ id: 1, role: "admin", authId: 99 }),
      ).rejects.toEqual(
        new HttpError(
          "Cannot delete variant with active orders. Please resolve orders first.",
          400,
        ),
      );
    });

    it("soft deletes if previous orders exist", async () => {
      mockedModel.findVariant.mockResolvedValueOnce({
        id: 1,
        sellerId: 10,
      } as any);
      mockedPrisma.orderItem.count
        .mockResolvedValueOnce(0) // active
        .mockResolvedValueOnce(3); // total

      mockedModel.updateVariant.mockResolvedValueOnce({
        id: 1,
        status: "draft",
      } as any);

      await variantService.deleteVariant({ id: 1, role: "seller", authId: 10 });
      expect(mockedModel.updateVariant).toHaveBeenCalledWith(1, {
        status: "draft",
      });
    });

    it("hard deletes if no orders exist", async () => {
      mockedModel.findVariant.mockResolvedValueOnce({
        id: 1,
        sellerId: 10,
      } as any);
      mockedPrisma.orderItem.count.mockResolvedValue(0);

      await variantService.deleteVariant({ id: 1, role: "admin", authId: 99 });

      expect(mockedPrisma.$transaction).toHaveBeenCalled();
      expect(mockedPrisma.variant.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe("getVariant", () => {
    it("returns variant when found", async () => {
      mockedModel.findVariant.mockResolvedValueOnce({ id: 1 } as any);
      const res = await variantService.getVariant({ id: 1 });
      expect(res.id).toBe(1);
    });
  });

  describe("getVariants", () => {
    it("returns paginated data", async () => {
      mockedModel.countVariants.mockResolvedValueOnce(1);
      mockedModel.findVariants.mockResolvedValueOnce([{ id: 1 }] as any);
      const res = await variantService.getVariants({ productId: "10" });
      expect(res.variants).toHaveLength(1);
    });
  });
});
