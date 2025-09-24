import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/customError";
import * as addressModel from "./address.model";

export const createAddress = async ({
  userId,
  street,
  city,
  state,
  country,
  postalCode,
  latitude,
  longitude,
  addressLine,
}: {
  userId: number;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  addressLine: string;
}) => {
  const address = await addressModel.createAddress({
    user: { connect: { id: +userId } },
    street,
    city,
    state,
    country,
    postalCode,
    latitude,
    longitude,
    addressLine,
  });
  return address;
};

export const getAddresses = async (queryParams: {
  userId?: string | string[] | null;
}) => {
  const rawUserId = Array.isArray(queryParams.userId)
    ? queryParams.userId[0]
    : queryParams.userId;

  const findArgs: any = {
    select: {
      id: true,
      userId: true,
      street: true,
      city: true,
      state: true,
      country: true,
      postalCode: true,
      latitude: true,
      longitude: true,
      addressLine: true,
    },
  };

  if (rawUserId) {
    findArgs.where = { userId: +rawUserId };
  }

  const addresses = await addressModel.findAddresses(findArgs);
  return addresses;
};

export const getAddress = async (query: { id: number }) => {
  const address = await addressModel.findAddress({
    where: query,
    select: {
      id: true,
      userId: true,
      street: true,
      city: true,
      state: true,
      country: true,
      postalCode: true,
      latitude: true,
      longitude: true,
      addressLine: true,
    },
  });
  if (!address) throw new HttpError("Address Not found!", 404);
  return address;
};

export const updateAddress = async (
  id: number,
  role: string,
  userId: number,
  data: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    addressLine?: string;
  }
) => {
  const existingAddress = await addressModel.findAddress({
    where: { id },
  });
  if (role === "admin" || userId === existingAddress?.userId) {
    return addressModel.updateAddress(id, data);
  }
  throw new HttpError("Permission denied!", 403);
};

export const deleteAddress = async ({
  id,
  role,
  userId,
}: {
  userId: number;
  id: number;
  role: string;
}) => {
  // Check if address exists
  const address = await addressModel.findAddress({
    where: { id },
    select: { id: true, userId: true },
  });
  if (!address) {
    throw new HttpError("Address not found!", 404);
  }
  if (role === "admin" || userId === address.userId) {
    // Block deletion if any active orders use this address
    const activeOrderCount = await prisma.orders.count({
      where: {
        status: "active",
        OR: [{ deliveryAddressId: id }, { pickupAddressId: id }],
      },
    });

    if (activeOrderCount > 0) {
      throw new HttpError(
        `Cannot delete address. It is used by ${activeOrderCount} active order(s).`,
        400
      );
    }

    return addressModel.deleteAddress(id);
  }
  throw new HttpError("Permission denied!", 403);
};
