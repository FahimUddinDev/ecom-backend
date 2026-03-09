// Offer service unit tests
import { HttpError } from "../../utils/customError";
import * as offerModel from "./offer.model";
import * as offerService from "./offer.service";

jest.mock("./offer.model");

const mockedModel = offerModel as jest.Mocked<typeof offerModel>;

describe("offer.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOffer", () => {
    it("creates an offer with normalized dates", async () => {
      mockedModel.createOffer.mockResolvedValueOnce({ id: 1 } as any);
      await offerService.createOffer({
        name: "Black Friday Sale",
        offerType: "product",
        discountType: "percentage",
        discountValue: 20,
        startDate: "2024-11-25",
        sellerId: 10,
      });

      expect(mockedModel.createOffer).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
          name: "Black Friday Sale",
        }),
      );
    });
  });

  describe("updateOffer", () => {
    it("throws error if offer not found", async () => {
      mockedModel.findOffer.mockResolvedValueOnce(null);
      await expect(
        offerService.updateOffer(1, { name: "Updated" }),
      ).rejects.toThrow("Offer not found");
    });

    it("updates and parses dates", async () => {
      mockedModel.findOffer.mockResolvedValueOnce({ id: 1 } as any);
      mockedModel.updateOffer.mockResolvedValueOnce({ id: 1 } as any);
      await offerService.updateOffer(1, { startDate: "2025-01-01" });
      expect(mockedModel.updateOffer).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          startDate: expect.any(Date),
        }),
      );
    });
  });

  describe("deleteOffer", () => {
    it("throws 404 if not found", async () => {
      mockedModel.findOffer.mockResolvedValueOnce(null);
      await expect(
        offerService.deleteOffer({ id: 1, role: "admin", authId: 99 }),
      ).rejects.toEqual(new HttpError("Offer not found!", 404));
    });

    it("throws 403 if unauthorized seller", async () => {
      mockedModel.findOffer.mockResolvedValueOnce({ sellerId: 10 } as any);
      await expect(
        offerService.deleteOffer({ id: 1, role: "seller", authId: 11 }),
      ).rejects.toEqual(new HttpError("Permission denied!", 403));
    });

    it("allows deletion by admin", async () => {
      mockedModel.findOffer.mockResolvedValueOnce({ sellerId: 10 } as any);
      await offerService.deleteOffer({ id: 1, role: "admin", authId: 99 });
      expect(mockedModel.deleteOffer).toHaveBeenCalledWith(1);
    });
  });

  describe("getOffer", () => {
    it("throws 404 if not found", async () => {
      mockedModel.findOffer.mockResolvedValueOnce(null);
      await expect(offerService.getOffer({ id: 99 })).rejects.toEqual(
        new HttpError("Offer Not found!", 404),
      );
    });

    it("returns offer with includes", async () => {
      mockedModel.findOffer.mockResolvedValueOnce({
        id: 1,
        name: "Sale",
      } as any);
      const res = await offerService.getOffer({ id: 1 });
      expect(res.id).toBe(1);
    });
  });

  describe("getOffers", () => {
    it("returns paginated and filtered offers", async () => {
      mockedModel.countOffers.mockResolvedValueOnce(1);
      mockedModel.findOffers.mockResolvedValueOnce([{ id: 1 }] as any);
      const res = await offerService.getOffers({ search: "Sale" });
      expect(res.offers).toHaveLength(1);
      expect(mockedModel.findOffers).toHaveBeenCalled();
    });
  });
});
