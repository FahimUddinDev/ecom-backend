// ChildCategory service unit tests
import fs from "fs";
import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/customError";
import * as childCategoryModel from "./childCategory.model";
import * as childCategoryService from "./childCategory.service";

jest.mock("./childCategory.model");
jest.mock("fs");
jest.mock("../../config/prisma", () => ({
  prisma: {
    product: { count: jest.fn() },
  },
}));

const mockedChildCategoryModel = childCategoryModel as jest.Mocked<
  typeof childCategoryModel
>;
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedFs = fs as unknown as jest.Mocked<typeof fs>;

describe("childCategory.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createChildCategory", () => {
    it("throws 409 if child category exists in same subcategory", async () => {
      mockedChildCategoryModel.findChildCategory.mockResolvedValueOnce({
        id: 1,
      } as any);
      await expect(
        childCategoryService.createChildCategory({
          subCategoryId: 10,
          name: "Trail Running",
          thumbnail: null,
        }),
      ).rejects.toEqual(new HttpError("This category already exist!", 409));
    });

    it("creates child category with lowercase name", async () => {
      mockedChildCategoryModel.findChildCategory.mockResolvedValueOnce(null);
      mockedChildCategoryModel.createChildCategory.mockResolvedValueOnce({
        id: 2,
        name: "trail running",
      } as any);
      const res = await childCategoryService.createChildCategory({
        subCategoryId: 10,
        name: "Trail Running",
        thumbnail: "t.jpg",
      });
      expect(mockedChildCategoryModel.createChildCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "trail running",
          thumbnail: "/public/t.jpg",
        }),
      );
      expect(res.id).toBe(2);
    });
  });

  describe("getChildCategory", () => {
    it("throws 404 if not found", async () => {
      mockedChildCategoryModel.findChildCategory.mockResolvedValueOnce(null);
      await expect(
        childCategoryService.getChildCategory({ id: 99 }),
      ).rejects.toEqual(new HttpError("Child Category Not found!", 404));
    });

    it("returns child category when found", async () => {
      mockedChildCategoryModel.findChildCategory.mockResolvedValueOnce({
        id: 5,
      } as any);
      const res = await childCategoryService.getChildCategory({ id: 5 });
      expect(res.id).toBe(5);
    });
  });

  describe("updateChildCategory", () => {
    it("throws 403 if not admin", async () => {
      await expect(
        childCategoryService.updateChildCategory(1, "user", { name: "New" }),
      ).rejects.toEqual(new HttpError("Permission denied!", 403));
    });

    it("cleans up old thumbnail when new one provided", async () => {
      mockedChildCategoryModel.findChildCategory.mockResolvedValueOnce({
        id: 1,
        thumbnail: "/public/old.jpg",
      } as any);
      mockedChildCategoryModel.updateChildCategory.mockResolvedValueOnce({
        id: 1,
      } as any);
      (mockedFs.access as any).mockImplementation((p: any, m: any, cb: any) =>
        cb(null),
      );
      (mockedFs.unlink as any).mockImplementation((p: any, cb: any) =>
        cb(null),
      );

      await childCategoryService.updateChildCategory(1, "admin", {
        thumbnail: "new.jpg",
      });
      expect(mockedFs.unlink).toHaveBeenCalled();
    });
  });

  describe("deleteChildCategory", () => {
    it("throws 403 if not admin", async () => {
      await expect(
        childCategoryService.deleteChildCategory({ id: 1, role: "user" }),
      ).rejects.toEqual(new HttpError("Permission denied!", 403));
    });

    it("throws 404 if not found", async () => {
      mockedChildCategoryModel.findChildCategory.mockResolvedValueOnce(null);
      await expect(
        childCategoryService.deleteChildCategory({ id: 1, role: "admin" }),
      ).rejects.toEqual(
        new HttpError("Don't have any Child category with this id.", 404),
      );
    });

    it("throws 400 if has products", async () => {
      mockedChildCategoryModel.findChildCategory.mockResolvedValueOnce({
        id: 1,
      } as any);
      (mockedPrisma.product.count as jest.Mock).mockResolvedValueOnce(5);
      await expect(
        childCategoryService.deleteChildCategory({ id: 1, role: "admin" }),
      ).rejects.toEqual(
        new HttpError(
          "Cannot delete category. It has 5 products. Please move or delete all products first.",
          400,
        ),
      );
    });

    it("hard deletes and cleans up thumbnail", async () => {
      mockedChildCategoryModel.findChildCategory.mockResolvedValueOnce({
        id: 1,
        thumbnail: "/public/child.jpg",
      } as any);
      (mockedPrisma.product.count as jest.Mock).mockResolvedValueOnce(0);
      (mockedFs.access as any).mockImplementation((p: any, m: any, cb: any) =>
        cb(null),
      );
      (mockedFs.unlink as any).mockImplementation((p: any, cb: any) =>
        cb(null),
      );

      await childCategoryService.deleteChildCategory({ id: 1, role: "admin" });
      expect(mockedChildCategoryModel.deleteChildCategory).toHaveBeenCalledWith(
        1,
      );
    });
  });
});
