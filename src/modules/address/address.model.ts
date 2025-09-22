// User model
import { Address, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findAddress = async (
  query: Prisma.AddressFindUniqueArgs
): Promise<Address | null> => {
  return prisma.address.findUnique(query);
};

export const createAddress = async (
  data: Prisma.AddressCreateInput
): Promise<Address> => {
  return prisma.address.create({ data });
};

export const findAddresses = async (query: {}): Promise<Address[] | null> => {
  return prisma.address.findMany(query);
};

export const updateAddress = async (id: number, data: Partial<Address>) => {
  return prisma.address.update({
    where: { id },
    data,
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
};

export const deleteAddress = async (id: number): Promise<Address> => {
  return prisma.address.delete({ where: { id } });
};
