// SubCategory service unit tests
import fs from "fs";
import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/customError";
import * as subCategoryModel from "./subCategory.model";
import * as subCategoryService from "./subCategory.service";

jest.mock("./subCategory.model");
jest.mock("fs");
jest.mock("../../config/prisma", () => ({
  prisma: {
    childCategories: { count: jest.fn() },
    product: { count: jest.fn() },
  },
}));

const mockedSubCategoryModel = subCategoryModel as jest.Mocked<
  typeof subCategoryModel
>;
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedFs = fs as unknown as jest.Mocked<typeof fs>;

describe("subCategory.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSubCategory", () => {
    it("throws 409 if subcategory exists in same category", async () => {
      mockedSubCategoryModel.findSubCategory.mockResolvedValueOnce({
        id: 1,
      } as any);
      await expect(
        subCategoryService.createSubCategory({
          categoryId: 10,
          name: "Running Shoes",
          thumbnail: null,
        }),
      ).rejects.toEqual(new HttpError("This category already exist!", 409));
    });

    it("creates subcategory with lowercase name", async () => {
      mockedSubCategoryModel.findSubCategory.mockResolvedValueOnce(null);
      mockedSubCategoryModel.createSubCategory.mockResolvedValueOnce({
        id: 2,
        name: "running shoes",
      } as any);
      const res = await subCategoryService.createSubCategory({
        categoryId: 10,
        name: "Running Shoes",
        thumbnail: "img.jpg",
      });
      expect(mockedSubCategoryModel.createSubCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "running shoes",
          thumbnail: "/public/img.jpg",
        }),
      );
      expect(res.id).toBe(2);
    });
  });

  describe("getSubCategory", () => {
    it("throws 404 if not found", async () => {
      mockedSubCategoryModel.findSubCategory.mockResolvedValueOnce(null);
      await expect(
        subCategoryService.getSubCategory({ id: 99 }),
      ).rejects.toEqual(new HttpError("Sub Category Not found!", 404));
    });

    it("returns subcategory when found", async () => {
      mockedSubCategoryModel.findSubCategory.mockResolvedValueOnce({
        id: 5,
      } as any);
      const res = await subCategoryService.getSubCategory({ id: 5 });
      expect(res.id).toBe(5);
    });
  });

  describe("updateSubCategory", () => {
    it("throws 403 if not admin", async () => {
      await expect(
        subCategoryService.updateSubCategory(1, "user", { name: "New" }),
      ).rejects.toEqual(new HttpError("Permission denied!", 403));
    });

    it("cleans up old thumbnail when new one provided", async () => {
      mockedSubCategoryModel.findSubCategory.mockResolvedValueOnce({
        id: 1,
        thumbnail: "/public/old.jpg",
      } as any);
      mockedSubCategoryModel.updateSubCategory.mockResolvedValueOnce({
        id: 1,
      } as any);
      (mockedFs.access as any).mockImplementation((p: any, m: any, cb: any) =>
        cb(null),
      );
      (mockedFs.unlink as any).mockImplementation((p: any, cb: any) =>
        cb(null),
      );

      await subCategoryService.updateSubCategory(1, "admin", {
        thumbnail: "new.jpg",
      });
      expect(mockedFs.unlink).toHaveBeenCalled();
    });
  });

  describe("deleteSubCategory", () => {
    it("throws 403 if not admin", async () => {
      await expect(
        subCategoryService.deleteSubCategory({ id: 1, role: "user" }),
      ).rejects.toEqual(new HttpError("Permission denied!", 403));
    });

    it("throws 400 if has child categories", async () => {
      mockedSubCategoryModel.findSubCategory.mockResolvedValueOnce({
        id: 1,
      } as any);
      (mockedPrisma.childCategories.count as jest.Mock).mockResolvedValueOnce(
        3,
      );
      await expect(
        subCategoryService.deleteSubCategory({ id: 1, role: "admin" }),
      ).rejects.toEqual(
        new HttpError(
          "Cannot delete category. It has 3 subcategories. Please delete all subcategories first.",
          400,
        ),
      );
    });

    it("throws 400 if has products", async () => {
      mockedSubCategoryModel.findSubCategory.mockResolvedValueOnce({
        id: 1,
      } as any);
      (mockedPrisma.childCategories.count as jest.Mock).mockResolvedValueOnce(
        0,
      );
      (mockedPrisma.product.count as jest.Mock).mockResolvedValueOnce(10);
      await expect(
        subCategoryService.deleteSubCategory({ id: 1, role: "admin" }),
      ).rejects.toEqual(
        new HttpError(
          "Cannot delete category. It has 10 products. Please move or delete all products first.",
          400,
        ),
      );
    });

    it("hard deletes and cleans up thumbnail", async () => {
      mockedSubCategoryModel.findSubCategory.mockResolvedValueOnce({
        id: 1,
        thumbnail: "/public/sub.jpg",
      } as any);
      (mockedPrisma.childCategories.count as jest.Mock).mockResolvedValueOnce(
        0,
      );
      (mockedPrisma.product.count as jest.Mock).mockResolvedValueOnce(0);
      (mockedFs.access as any).mockImplementation((p: any, m: any, cb: any) =>
        cb(null),
      );
      (mockedFs.unlink as any).mockImplementation((p: any, cb: any) =>
        cb(null),
      );

      await subCategoryService.deleteSubCategory({ id: 1, role: "admin" });
      expect(mockedSubCategoryModel.deleteSubCategory).toHaveBeenCalledWith(1);
    });
  });
});
