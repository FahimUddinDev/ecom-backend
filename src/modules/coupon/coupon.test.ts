// Coupon service unit tests
import { HttpError } from "../../utils/customError";
import * as couponModel from "./coupon.model";
import * as couponService from "./coupon.service";

jest.mock("./coupon.model");

const mockedModel = couponModel as jest.Mocked<typeof couponModel>;

describe("coupon.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCoupon", () => {
    it("creates a coupon with normalized dates", async () => {
      mockedModel.createCoupon.mockResolvedValueOnce({ id: 1 } as any);
      await couponService.createCoupon({
        code: "TEST10",
        referralCode: "REF10",
        description: "Test Discount",
        discountType: "percentage",
        discountValue: 10,
        startDate: "2024-01-01",
        usageLimit: 100,
      } as any);

      expect(mockedModel.createCoupon).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
        }),
      );
    });
  });

  describe("deleteCoupon", () => {
    it("throws 404 if not found", async () => {
      mockedModel.findCoupon.mockResolvedValueOnce(null);
      await expect(
        couponService.deleteCoupon({ id: 1, role: "admin", authId: 99 }),
      ).rejects.toEqual(new HttpError("Coupon not found!", 404));
    });

    it("throws 403 if seller is not the owner", async () => {
      mockedModel.findCoupon.mockResolvedValueOnce({ sellerId: 10 } as any);
      await expect(
        couponService.deleteCoupon({ id: 1, role: "seller", authId: 11 }),
      ).rejects.toEqual(new HttpError("Permission denied!", 403));
    });

    it("allows deletion by admin", async () => {
      mockedModel.findCoupon.mockResolvedValueOnce({ sellerId: 10 } as any);
      mockedModel.deleteCoupon.mockResolvedValueOnce({ id: 1 } as any);
      await couponService.deleteCoupon({ id: 1, role: "admin", authId: 99 });
      expect(mockedModel.deleteCoupon).toHaveBeenCalledWith(1);
    });
  });

  describe("getCoupons", () => {
    it("builds query and returns paginated list", async () => {
      mockedModel.countCoupons.mockResolvedValueOnce(1);
      mockedModel.findCoupons.mockResolvedValueOnce([{ id: 10 }] as any);

      const res = await couponService.getCoupons({
        search: "SALE",
        sellerId: 5,
      });

      expect(mockedModel.findCoupons).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sellerId: 5,
            OR: [{ code: { contains: "SALE" } }],
          }),
        }),
      );
      expect(res.coupons).toHaveLength(1);
    });
  });

  describe("createCouponReferral", () => {
    it("throws 403 if seller doesn't own coupon", async () => {
      mockedModel.findCoupon.mockResolvedValueOnce({ sellerId: 10 } as any);
      await expect(
        couponService.createCouponReferral({
          couponId: 1,
          ipAddress: "1.1.1.1",
          userId: 5,
          authId: 11,
          role: "seller",
        }),
      ).rejects.toEqual(new HttpError("Permission denied!", 403));
    });

    it("creates referral log when authorized", async () => {
      mockedModel.findCoupon.mockResolvedValueOnce({ sellerId: 10 } as any);
      mockedModel.createCouponReferral.mockResolvedValueOnce({
        id: 100,
      } as any);
      await couponService.createCouponReferral({
        couponId: 1,
        ipAddress: "1.1.1.1",
        userId: 5,
        authId: 10,
        role: "seller",
      });
      expect(mockedModel.createCouponReferral).toHaveBeenCalled();
    });
  });

  describe("createCouponUsage", () => {
    it("creates usage log when authorized", async () => {
      mockedModel.findCoupon.mockResolvedValueOnce({ sellerId: 20 } as any);
      mockedModel.createCouponUsage.mockResolvedValueOnce({ id: 500 } as any);
      await couponService.createCouponUsage({
        couponId: 1,
        userId: 5,
        authId: 20,
        role: "seller",
      });
      expect(mockedModel.createCouponUsage).toHaveBeenCalled();
    });
  });
});
