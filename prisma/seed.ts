import { DiscountType, OfferType, PrismaClient, Status } from "@prisma/client";

const prisma = new PrismaClient();

const uploadImages = [
  "1752696599862-famin.jpg",
  "1752778233078-profile2.jpg",
  "1752778595345-profile2.jpg",
  "1752778694750-famin.jpg",
];

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      firstName: "Super",
      lastName: "Admin",
      email: "admin@example.com",
      password: "$2b$10$8BGmY26ho9.uyFe2MUhn.ejs1p/iW/bTgbEY5/9msE.SFXComCVjm", // In a real app, hash this!
      role: "admin",
      status: "active",
      verified: true,
      avatar: uploadImages[1],
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: "seller@example.com" },
    update: {},
    create: {
      firstName: "Best",
      lastName: "Seller",
      email: "seller@example.com",
      password: "$2b$10$8BGmY26ho9.uyFe2MUhn.ejs1p/iW/bTgbEY5/9msE.SFXComCVjm",
      role: "seller",
      status: "active",
      verified: true,
      avatar: uploadImages[0],
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      firstName: "Regular",
      lastName: "User",
      email: "user@example.com",
      password: "$2b$10$8BGmY26ho9.uyFe2MUhn.ejs1p/iW/bTgbEY5/9msE.SFXComCVjm",
      role: "user",
      status: "active",
      verified: true,
      avatar: uploadImages[2],
    },
  });

  console.log("Users seeded successfully.");

  // 2. Create Categories hierarchy
  const electronics = await prisma.categories.upsert({
    where: { name: "Electronics" },
    update: {},
    create: {
      name: "Electronics",
      thumbnail: uploadImages[0],
      subCategories: {
        create: [
          {
            name: "Smartphones",
            thumbnail: uploadImages[1],
            childCategories: {
              create: [
                { name: "Android", thumbnail: uploadImages[2] },
                { name: "iOS", thumbnail: uploadImages[3] },
              ],
            },
          },
          {
            name: "Laptops",
            thumbnail: uploadImages[1],
            childCategories: {
              create: [
                { name: "Gaming", thumbnail: uploadImages[2] },
                { name: "Ultrabooks", thumbnail: uploadImages[3] },
              ],
            },
          },
        ],
      },
    },
  });

  // Find sub/child categories for product linking since nested create doesn't return deep structures easily
  const smartphoneSub = await prisma.subCategories.findFirst({
    where: {
      name: "Smartphones",
      categoryId: electronics.id,
    },
  });

  const androidChild = await prisma.childCategories.findFirst({
    where: {
      name: "Android",
      subCategoryId: smartphoneSub?.id,
    },
  });

  const fashion = await prisma.categories.upsert({
    where: { name: "Fashion" },
    update: {},
    create: {
      name: "Fashion",
      thumbnail: uploadImages[0],
      subCategories: {
        create: [
          {
            name: "Men",
            thumbnail: uploadImages[1],
            childCategories: {
              create: [
                { name: "Shirts", thumbnail: uploadImages[2] },
                { name: "Pants", thumbnail: uploadImages[3] },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Categories seeded successfully.");

  if (!smartphoneSub || !androidChild) {
    console.warn("Could not find created categories, skipping products seed.");
  } else {
    // 3. Create Products
    const product1 = await prisma.product.create({
      data: {
        slug: "galaxy-s24-ultra",
        name: "Samsung Galaxy S24 Ultra",
        description: "The latest flagship from Samsung with AI features.",
        shortDescription: "AI powered smartphone",
        price: 1299.99,
        currency: "USD",
        stockQuantity: 50,
        sku: "SAMSUNG-S24U-001",
        hasVariants: true,
        status: Status.active,
        sellerId: seller.id,
        categoryId: electronics.id,
        subCategoryId: smartphoneSub.id,
        childCategoryId: androidChild.id,
        images: [uploadImages[0], uploadImages[1]],
        thumbnail: uploadImages[0],
        tags: ["smartphone", "android", "samsung", "ai"],
        variants: {
          create: [
            {
              type: "Color",
              name: "Titanium Black",
              price: 1299.99,
              stockQuantity: 20,
              sku: "SAMSUNG-S24U-BLK",
              images: [uploadImages[0]],
              thumbnail: uploadImages[0],
              sellerId: seller.id,
              status: Status.active,
            },
            {
              type: "Color",
              name: "Titanium Gray",
              price: 1299.99,
              stockQuantity: 30,
              sku: "SAMSUNG-S24U-GRY",
              images: [uploadImages[1]],
              thumbnail: uploadImages[1],
              sellerId: seller.id,
              status: Status.active,
            },
          ],
        },
        reviews: {
          create: [
            {
              userId: user.id,
              rating: 5,
              comment: "Amazing phone! The camera is incredible.",
            },
          ],
        },
      },
    });

    const product2 = await prisma.product.create({
      data: {
        slug: "iphone-15-pro",
        name: "Apple iPhone 15 Pro",
        description: "Titanium design, A17 Pro chip.",
        shortDescription: "The most powerful iPhone yet.",
        price: 999.99,
        currency: "USD",
        stockQuantity: 100,
        sku: "APPLE-15PRO-001",
        hasVariants: false,
        status: Status.active,
        sellerId: seller.id,
        categoryId: electronics.id,
        subCategoryId: smartphoneSub.id,
        childCategoryId: androidChild.id, // Reusing android for simplicity in seed
        images: [uploadImages[2], uploadImages[3]],
        thumbnail: uploadImages[2],
        tags: ["smartphone", "apple", "ios"],
      },
    });

    console.log("Products seeded successfully.");

    // 4. Create Offers and Coupons
    await prisma.offer.create({
      data: {
        name: "Summer Sale",
        description: "Get 20% off on all electronics",
        offerType: OfferType.product,
        discountType: DiscountType.percentage,
        discountValue: 20,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: Status.active,
        products: {
          create: [{ productId: product1.id }, { productId: product2.id }],
        },
      },
    });
  }

  await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      description: "10% off for new users",
      discountType: DiscountType.percentage,
      discountValue: 10,
      usageLimit: 100,
      startDate: new Date(),
      sellerId: seller.id,
    },
  });

  console.log("Offers and Coupons seeded successfully.");

  console.log("🌱 Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
