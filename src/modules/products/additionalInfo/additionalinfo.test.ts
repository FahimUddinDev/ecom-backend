// AdditionalInfo service unit tests
import { prisma } from "../../../config/prisma";
import { HttpError } from "../../../utils/customError";
import * as additionalInfoModel from "./additionalinfo.model";
import * as additionalInfoService from "./additionalinfo.service";

jest.mock("./additionalinfo.model");
jest.mock("../../../config/prisma", () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(prisma)),
    additionalInfo: { create: jest.fn() },
  },
}));

const mockedModel = additionalInfoModel as jest.Mocked<
  typeof additionalInfoModel
>;
const mockedPrisma = prisma as any;

describe("additionalInfo.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createAdditionalInfo", () => {
    it("creates an entry successfully", async () => {
      mockedModel.createAdditionalInfo.mockResolvedValueOnce({ id: 1 } as any);
      await additionalInfoService.createAdditionalInfo({
        productId: 10,
        name: "Material",
        value: "Cotton",
      });
      expect(mockedModel.createAdditionalInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Material",
          value: "Cotton",
        }),
      );
    });
  });

  describe("createAdditionalInfos (Bulk)", () => {
    it("creates multiple entries in a transaction", async () => {
      mockedPrisma.additionalInfo.create.mockResolvedValue({ id: 1 } as any);
      await additionalInfoService.createAdditionalInfos({
        productId: 10,
        additionalInfos: [
          { name: "Color", value: "Red" },
          { name: "Size", value: "L" },
        ],
      });
      expect(mockedPrisma.$transaction).toHaveBeenCalled();
      expect(mockedPrisma.additionalInfo.create).toHaveBeenCalledTimes(2);
    });
  });

  describe("updateAdditionalInfo", () => {
    it("throws error if not found", async () => {
      mockedModel.findAdditionalInfo.mockResolvedValueOnce(null);
      await expect(
        additionalInfoService.updateAdditionalInfo(1, { value: "Updated" }),
      ).rejects.toThrow("AdditionalInfo not found");
    });

    it("updates entry successfully", async () => {
      mockedModel.findAdditionalInfo.mockResolvedValueOnce({ id: 1 } as any);
      mockedModel.updateAdditionalInfo.mockResolvedValueOnce({ id: 1 } as any);
      await additionalInfoService.updateAdditionalInfo(1, { name: "New Name" });
      expect(mockedModel.updateAdditionalInfo).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          name: "New Name",
        }),
      );
    });
  });

  describe("deleteAdditionalInfo", () => {
    it("throws 404 if not found", async () => {
      mockedModel.findAdditionalInfo.mockResolvedValueOnce(null);
      await expect(
        additionalInfoService.deleteAdditionalInfo({
          id: 1,
          role: "admin",
          authId: 99,
        }),
      ).rejects.toEqual(new HttpError("AdditionalInfo not found!", 404));
    });

    it("throws 403 if unauthorized seller", async () => {
      mockedModel.findAdditionalInfo.mockResolvedValueOnce({
        product: { sellerId: 10 },
      } as any);
      await expect(
        additionalInfoService.deleteAdditionalInfo({
          id: 1,
          role: "seller",
          authId: 11,
        }),
      ).rejects.toEqual(new HttpError("Permission denied!", 403));
    });

    it("allows deletion by owner seller", async () => {
      mockedModel.findAdditionalInfo.mockResolvedValueOnce({
        product: { sellerId: 10 },
      } as any);
      await additionalInfoService.deleteAdditionalInfo({
        id: 1,
        role: "seller",
        authId: 10,
      });
      expect(mockedModel.deleteAdditionalInfo).toHaveBeenCalledWith(1);
    });
  });

  describe("getAdditionalInfos", () => {
    it("returns paginated data", async () => {
      mockedModel.countAdditionalInfos.mockResolvedValueOnce(1);
      mockedModel.findAdditionalInfos.mockResolvedValueOnce([{ id: 1 }] as any);
      const res = await additionalInfoService.getAdditionalInfos({
        search: "test",
      });
      expect(res.additionalInfos).toHaveLength(1);
    });
  });
});
