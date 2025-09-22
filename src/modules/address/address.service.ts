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

// export const getAddress = async (query: { id: number } | { name: string }) => {
//   const address = await addressModel.findAddress({
//     where: query,
//     select: {
//       id: true,
//       name: true,
//       thumbnail: true,
//       subCategories: {
//         select: {
//           id: true,
//           name: true,
//           thumbnail: true,
//           childCategories: {
//             select: {
//               id: true,
//               name: true,
//               thumbnail: true,
//             },
//           },
//         },
//       },
//     },
//   });
//   if (!address) throw new HttpError("Address Not found!", 404);
//   return address;
// };

// export const updateAddress = async (
//   id: number,
//   role: string,
//   data: Partial<{
//     name: string;
//     thumbnail: string | null;
//   }>
// ) => {
//   if (role !== "admin") {
//     throw new HttpError("Permission denied!", 403);
//   }
//   // 2. Delete old thumbnail if new thumbnail is provided
//   if (data?.thumbnail) {
//     const existingAddress = await addressModel.findAddress({
//       where: { id },
//     });
//     const oldThumbnailPath = existingAddress?.thumbnail;

//     if (oldThumbnailPath) {
//       const filename = oldThumbnailPath.replace("/public/", "");
//       const filePath = path.join(__dirname, "../../../../uploads", filename);
//       fs.access(filePath, fs.constants.F_OK, (err) => {
//         if (!err) {
//           fs.unlink(filePath, (err) => {
//             if (err) console.error("Failed to delete old avatar:", err);
//           });
//         }
//       });
//     }
//   }
//   return addressModel.updateAddress(id, data);
// };

// export const deleteAddress = async ({
//   id,
//   role,
// }: {
//   id: number;
//   role: string;
// }) => {
//   if (role !== "admin") {
//     throw new HttpError("Permission denied!", 403);
//   }

//   // Check if address exists
//   const address = await addressModel.findAddress({
//     where: { id },
//     select: { id: true, thumbnail: true },
//   });
//   if (!address) {
//     throw new HttpError("Address not found!", 404);
//   }

//   // Check if address has any subaddresses
//   const subCategoriesCount = await prisma.subCategories.count({
//     where: { addressId: id },
//   });

//   if (subCategoriesCount > 0) {
//     throw new HttpError(
//       `Cannot delete address. It has ${subCategoriesCount} subaddresses. Please delete all subaddresses first.`,
//       400
//     );
//   }

//   // Check if address has any products
//   const productsCount = await prisma.product.count({
//     where: { addressId: id },
//   });

//   if (productsCount > 0) {
//     throw new HttpError(
//       `Cannot delete address. It has ${productsCount} products. Please move or delete all products first.`,
//       400
//     );
//   }

//   // Delete the address thumbnail file if it exists
//   if (address?.thumbnail) {
//     const filename = address.thumbnail.replace("/public/", "");
//     const filePath = path.join(__dirname, "../../../../uploads", filename);
//     fs.access(filePath, fs.constants.F_OK, (err) => {
//       if (!err) {
//         fs.unlink(filePath, (err) => {
//           if (err) console.error("Failed to delete address thumbnail:", err);
//         });
//       }
//     });
//   }

//   return addressModel.deleteAddress(id);
// };
