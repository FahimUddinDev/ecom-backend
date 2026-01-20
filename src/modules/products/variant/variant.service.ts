import { Prisma } from "@prisma/client";
import * as variantModel from "./variant.model";

export const getProduct = async (productId: number) => {
  const product = await variantModel.findProduct({
    where: { id: +productId },
    select: {
      id: true,
      hasVariants: true,
      seller: {
        select: {
          id: true,
        },
      },
    },
  });
  return {
    hasVariants: product.hasVariants,
    sellerId: product?.seller.id,
  };
};

export const createVariant = async ({
  sellerId,
  productId,
  price,
  currency,
  sku,
  stockQuantity,
  name,
  images,
  thumbnail,
  type,
}: {
  sellerId: number;
  productId: number;
  name: string;
  price: Prisma.Decimal;
  currency: string;
  sku: string | null;
  stockQuantity: number;
  images: string[];
  thumbnail: string;
  type: string;
}) => {
  const variant = await variantModel.createVariant({
    product: { connect: { id: +productId } },
    type,
    name,
    price,
    currency,
    sku,
    stockQuantity: Number(stockQuantity),
    images,
    thumbnail,
  });
  return {
    ...variant,
  };
};
