// Category service unit tests
import fs from "fs";
import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/customError";
import * as categoryModel from "./category.model";
import * as categoryService from "./category.service";

jest.mock("./category.model");
jest.mock("fs");
jest.mock("../../config/prisma", () => ({
  prisma: {
    subCategories: { count: jest.fn() },
    product: { count: jest.fn() },
  },
}));

const mockedCategoryModel = categoryModel as jest.Mocked<typeof categoryModel>;
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedFs = fs as unknown as jest.Mocked<typeof fs>;

describe("category.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCategory", () => {
    it("throws 409 if category already exists", async () => {
      mockedCategoryModel.findCategory.mockResolvedValueOnce({ id: 1 } as any);
      await expect(
        categoryService.createCategory({ name: "Shoes" }),
      ).rejects.toEqual(new HttpError("This category already exist!", 409));
    });

    it("creates category with lowercase name", async () => {
      mockedCategoryModel.findCategory.mockResolvedValueOnce(null);
      mockedCategoryModel.createCategory.mockResolvedValueOnce({
        id: 2,
        name: "shoes",
      } as any);
      const res = await categoryService.createCategory({ name: "SHOES" });
      expect(mockedCategoryModel.createCategory).toHaveBeenCalledWith(
        expect.objectContaining({ name: "shoes" }),
      );
      expect(res.id).toBe(2);
    });
  });

  describe("getCategory", () => {
    it("throws 404 if not found", async () => {
      mockedCategoryModel.findCategory.mockResolvedValueOnce(null);
      await expect(categoryService.getCategory({ id: 99 })).rejects.toEqual(
        new HttpError("Category Not found!", 404),
      );
    });

    it("returns category when found", async () => {
      mockedCategoryModel.findCategory.mockResolvedValueOnce({ id: 1 } as any);
      const res = await categoryService.getCategory({ id: 1 });
      expect(res.id).toBe(1);
    });
  });

  describe("updateCategory", () => {
    it("throws 403 if not admin", async () => {
      await expect(
        categoryService.updateCategory(1, "user", { name: "New" }),
      ).rejects.toEqual(new HttpError("Permission denied!", 403));
    });

    it("deletes old thumbnail if new one provided", async () => {
      mockedCategoryModel.findCategory.mockResolvedValueOnce({
        id: 1,
        thumbnail: "/public/old.jpg",
      } as any);
      mockedCategoryModel.updateCategory.mockResolvedValueOnce({
        id: 1,
      } as any);

      // Mock fs.access and fs.unlink
      (mockedFs.access as any).mockImplementation(
        (path: any, mode: any, cb: any) => cb(null),
      );
      (mockedFs.unlink as any).mockImplementation((path: any, cb: any) =>
        cb(null),
      );

      await categoryService.updateCategory(1, "admin", {
        thumbnail: "new.jpg",
      });
      expect(mockedFs.unlink).toHaveBeenCalled();
      expect(mockedCategoryModel.updateCategory).toHaveBeenCalled();
    });
  });

  describe("deleteCategory", () => {
    it("throws 403 if not admin", async () => {
      await expect(
        categoryService.deleteCategory({ id: 1, role: "user" }),
      ).rejects.toEqual(new HttpError("Permission denied!", 403));
    });

    it("throws 400 if has subcategories", async () => {
      mockedCategoryModel.findCategory.mockResolvedValueOnce({ id: 1 } as any);
      (mockedPrisma.subCategories.count as jest.Mock).mockResolvedValueOnce(2);
      await expect(
        categoryService.deleteCategory({ id: 1, role: "admin" }),
      ).rejects.toEqual(
        new HttpError(
          "Cannot delete category. It has 2 subcategories. Please delete all subcategories first.",
          400,
        ),
      );
    });

    it("throws 400 if has products", async () => {
      mockedCategoryModel.findCategory.mockResolvedValueOnce({ id: 1 } as any);
      (mockedPrisma.subCategories.count as jest.Mock).mockResolvedValueOnce(0);
      (mockedPrisma.product.count as jest.Mock).mockResolvedValueOnce(5);
      await expect(
        categoryService.deleteCategory({ id: 1, role: "admin" }),
      ).rejects.toEqual(
        new HttpError(
          "Cannot delete category. It has 5 products. Please move or delete all products first.",
          400,
        ),
      );
    });

    it("hard deletes and cleans up thumbnail", async () => {
      mockedCategoryModel.findCategory.mockResolvedValueOnce({
        id: 1,
        thumbnail: "/public/cat.jpg",
      } as any);
      (mockedPrisma.subCategories.count as jest.Mock).mockResolvedValueOnce(0);
      (mockedPrisma.product.count as jest.Mock).mockResolvedValueOnce(0);
      (mockedFs.access as any).mockImplementation(
        (path: any, mode: any, cb: any) => cb(null),
      );
      (mockedFs.unlink as any).mockImplementation((path: any, cb: any) =>
        cb(null),
      );

      await categoryService.deleteCategory({ id: 1, role: "admin" });
      expect(mockedFs.unlink).toHaveBeenCalled();
      expect(mockedCategoryModel.deleteCategory).toHaveBeenCalledWith(1);
    });
  });
});
