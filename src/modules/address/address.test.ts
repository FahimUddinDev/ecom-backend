// Address service unit tests
import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/customError";
import * as addressModel from "./address.model";
import * as addressService from "./address.service";

jest.mock("./address.model");
jest.mock("../../config/prisma", () => ({
  prisma: {
    orders: {
      count: jest.fn(),
    },
  },
}));

const mockedAddressModel = addressModel as jest.Mocked<typeof addressModel>;
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe("address.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createAddress", () => {
    it("creates an address successfully", async () => {
      const mockAddress = { id: 1, userId: 10, street: "Main St" } as any;
      mockedAddressModel.createAddress.mockResolvedValueOnce(mockAddress);

      const res = await addressService.createAddress({
        userId: 10,
        street: "Main St",
        city: "NY",
        state: "NY",
        country: "USA",
        postalCode: "10001",
        latitude: 40.7128,
        longitude: -74.006,
        addressLine: "Apt 4B",
      });

      expect(mockedAddressModel.createAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          user: { connect: { id: 10 } },
          street: "Main St",
        }),
      );
      expect(res).toEqual(mockAddress);
    });
  });

  describe("getAddresses", () => {
    it("returns list of addresses with status true", async () => {
      mockedAddressModel.findAddresses.mockResolvedValueOnce([
        { id: 1 },
      ] as any);
      const res = await addressService.getAddresses({ userId: "10" });
      expect(mockedAddressModel.findAddresses).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: true, userId: 10 },
        }),
      );
      expect(res).toHaveLength(1);
    });

    it("works without userId filter", async () => {
      mockedAddressModel.findAddresses.mockResolvedValueOnce([]);
      await addressService.getAddresses({});
      expect(mockedAddressModel.findAddresses).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: true },
        }),
      );
    });
  });

  describe("getAddress", () => {
    it("returns address when found", async () => {
      mockedAddressModel.findAddress.mockResolvedValueOnce({ id: 5 } as any);
      const res = await addressService.getAddress({ id: 5 });
      expect(res.id).toBe(5);
    });

    it("throws 404 when not found", async () => {
      mockedAddressModel.findAddress.mockResolvedValueOnce(null);
      await expect(addressService.getAddress({ id: 99 })).rejects.toEqual(
        new HttpError("Address Not found!", 404),
      );
    });
  });

  describe("updateAddress", () => {
    it("denies 403 if not owner or admin", async () => {
      mockedAddressModel.findAddress.mockResolvedValueOnce({
        userId: 10,
      } as any);
      await expect(
        addressService.updateAddress(1, "user", 11, { street: "New" }),
      ).rejects.toEqual(new HttpError("Permission denied!", 403));
    });

    it("allows update for owner", async () => {
      mockedAddressModel.findAddress.mockResolvedValueOnce({
        userId: 10,
      } as any);
      mockedAddressModel.updateAddress.mockResolvedValueOnce({ id: 1 } as any);
      await addressService.updateAddress(1, "user", 10, { street: "Updated" });
      expect(mockedAddressModel.updateAddress).toHaveBeenCalledWith(1, {
        street: "Updated",
      });
    });

    it("allows update for admin", async () => {
      mockedAddressModel.findAddress.mockResolvedValueOnce({
        userId: 10,
      } as any);
      mockedAddressModel.updateAddress.mockResolvedValueOnce({ id: 1 } as any);
      await addressService.updateAddress(1, "admin", 99, {
        street: "Admin Edit",
      });
      expect(mockedAddressModel.updateAddress).toHaveBeenCalledWith(1, {
        street: "Admin Edit",
      });
    });
  });

  describe("deleteAddress", () => {
    it("throws 404 if address not found", async () => {
      mockedAddressModel.findAddress.mockResolvedValueOnce(null);
      await expect(
        addressService.deleteAddress({ id: 1, role: "admin", userId: 99 }),
      ).rejects.toEqual(new HttpError("Address not found!", 404));
    });

    it("throws 403 if permission denied", async () => {
      mockedAddressModel.findAddress.mockResolvedValueOnce({
        userId: 10,
      } as any);
      await expect(
        addressService.deleteAddress({ id: 1, role: "user", userId: 11 }),
      ).rejects.toEqual(new HttpError("Permission denied!", 403));
    });

    it("blocks deletion if active orders exist", async () => {
      mockedAddressModel.findAddress.mockResolvedValueOnce({
        userId: 10,
      } as any);
      (mockedPrisma.orders.count as jest.Mock).mockResolvedValueOnce(1); // 1 active order

      await expect(
        addressService.deleteAddress({ id: 1, role: "admin", userId: 99 }),
      ).rejects.toEqual(
        new HttpError(
          "Cannot delete address. It is used by 1 active order(s).",
          400,
        ),
      );
    });

    it("soft deletes if non-active orders exist", async () => {
      mockedAddressModel.findAddress.mockResolvedValueOnce({
        userId: 10,
      } as any);
      (mockedPrisma.orders.count as jest.Mock)
        .mockResolvedValueOnce(0) // active
        .mockResolvedValueOnce(1); // any orders

      mockedAddressModel.updateAddress.mockResolvedValueOnce({
        id: 1,
        status: false,
      } as any);

      const res = await addressService.deleteAddress({
        id: 1,
        role: "admin",
        userId: 99,
      });
      expect(mockedAddressModel.updateAddress).toHaveBeenCalledWith(1, {
        status: false,
      });
      expect(res.status).toBe(false);
    });

    it("hard deletes if no orders exist", async () => {
      mockedAddressModel.findAddress.mockResolvedValueOnce({
        userId: 10,
      } as any);
      (mockedPrisma.orders.count as jest.Mock)
        .mockResolvedValueOnce(0) // active
        .mockResolvedValueOnce(0); // any orders

      mockedAddressModel.deleteAddress.mockResolvedValueOnce({ id: 1 } as any);

      await addressService.deleteAddress({ id: 1, role: "admin", userId: 99 });
      expect(mockedAddressModel.deleteAddress).toHaveBeenCalledWith(1);
    });
  });
});
