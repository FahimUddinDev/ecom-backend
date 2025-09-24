// User controller
import { Address } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import * as addressService from "./address.service";

export const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      street,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      addressLine,
    }: Address = req.body;

    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    const address = await addressService.createAddress({
      userId: user.data.id,
      street,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      addressLine,
    });

    res.status(201).json(address);
  } catch (err) {
    next(err);
  }
};
export const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await req.query;
    const addresses = await addressService.getAddresses(query);
    res.status(200).json(addresses);
  } catch (err) {
    next(err);
  }
};

export const getAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = await req.params.slug;
    const address = await addressService.getAddress({ id: +query });
    res.status(200).json(address);
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = await req.params.slug;
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    const data: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      latitude?: number;
      longitude?: number;
      addressLine?: string;
    } = req.body;
    const address = await addressService.updateAddress(
      parseInt(id),
      user.data.role,
      user.data.id,
      {
        ...data,
      }
    );

    res.status(200).json(address);
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = await req.params.slug;
    const { user } = req as Request & {
      user: { data: { id: number; role: string } };
    };
    await addressService.deleteAddress({
      id: parseInt(id),
      role: user.data.role,
      userId: user.data.id,
    });

    res.status(204).json({ message: "Deleted address successfully." });
  } catch (err) {
    next(err);
  }
};
