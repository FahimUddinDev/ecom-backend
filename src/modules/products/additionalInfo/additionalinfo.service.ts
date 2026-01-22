import { HttpError } from "../../../utils/customError";
import * as additionalInfoModel from "./additionalinfo.model";

export const getProduct = async (productId: number) => {
  const product = await additionalInfoModel.findProduct({
    where: { id: +productId },
    select: {
      id: true,
      sellerId: true,
    },
  });
  if (!product) throw new Error("Product not found");
  return product;
};

export const createAdditionalInfo = async ({
  productId,
  name,
  value,
}: {
  productId: number;
  name: string;
  value: string;
}) => {
  const additionalInfo = await additionalInfoModel.createAdditionalInfo({
    product: { connect: { id: +productId } },
    name,
    value,
  });
  return {
    ...additionalInfo,
  };
};

export const updateAdditionalInfo = async (
  id: number,
  data: Partial<{
    productId: number;
    name: string;
    value: string;
  }>,
) => {
  const existingAdditionalInfo = await additionalInfoModel.findAdditionalInfo({
    where: { id },
  });
  if (!existingAdditionalInfo) throw new Error("AdditionalInfo not found");

  const normalizedData = {
    ...data,
    ...(data.productId !== undefined && {
      productId: Number(data.productId),
    }),
  };

  const updatedAdditionalInfo = await additionalInfoModel.updateAdditionalInfo(
    id,
    normalizedData,
  );

  return updatedAdditionalInfo;
};

export const deleteAdditionalInfo = async ({
  id,
  role,
  authId,
}: {
  id: number;
  authId: number;
  role: string;
}) => {
  const additionalInfo = await additionalInfoModel.findAdditionalInfo({
    where: { id },
    include: {
      product: {
        select: {
          sellerId: true,
        },
      },
    },
  });
  if (!additionalInfo) throw new HttpError("AdditionalInfo not found!", 404);

  console.log(additionalInfo.product.sellerId, authId, role);
  if (
    role !== "admin" &&
    !(role === "seller" && additionalInfo.product.sellerId === authId)
  ) {
    throw new HttpError("Permission denied!", 403);
  }

  await additionalInfoModel.deleteAdditionalInfo(id);

  return { message: "AdditionalInfo and related data deleted successfully" };
};

export const getAdditionalInfo = async (query: { id: number }) => {
  const additionalInfo = await additionalInfoModel.findAdditionalInfo({
    where: query,
    select: {
      id: true,
      name: true,
      value: true,
    },
  });
  if (!additionalInfo) throw new HttpError("AdditionalInfo Not found!", 404);
  return additionalInfo;
};

export const getAdditionalInfos = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  productId?: string;
  sortBy?: string;
  createdAt?: string | { from?: string; to?: string };
  orderBy?: "asc" | "desc";
}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.search) {
    const keyword = query.search.trim();
    where.OR = [{ name: { contains: keyword } }];
  }
  if (query.productId) where.productId = Number(query.productId);

  // createdAt filter
  if (query.createdAt) {
    if (typeof query.createdAt === "string") {
      where.createdAt = { equals: new Date(query.createdAt) };
    } else if (typeof query.createdAt === "object") {
      where.createdAt = {};
      if (query.createdAt.from) {
        where.createdAt.gte = new Date(query.createdAt.from);
      }
      if (query.createdAt.to) {
        where.createdAt.lte = new Date(query.createdAt.to);
      }
    }
  }
  let orderBy: any[] = [];

  if (query.sortBy) {
    const fields = query.sortBy.split(",");
    const direction = query.orderBy === "asc" ? "asc" : "desc";

    orderBy.push(
      ...fields.map((field) => ({
        [field]: direction,
      })),
    );
  } else {
    orderBy.push({ createdAt: "desc" });
  }

  //  Get total count before pagination
  const total = await additionalInfoModel.countAdditionalInfos({ where });
  const additionalInfos = await additionalInfoModel.findAdditionalInfos({
    where,
    skip,
    take: limit,
    orderBy,
    select: {
      id: true,
      name: true,
      value: true,
    },
  });
  return {
    total,
    page,
    limit,
    additionalInfos,
  };
};
