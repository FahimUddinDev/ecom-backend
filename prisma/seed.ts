// Optional: Seed script for Prisma
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      firstName: "Fahim",
      lastName: "Uddin",
      email: "admin@gmail.com",
      password: "1234",
    },
  });

  console.log("🌱 Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
