// Prisma client instance
import { PrismaClient } from "@prisma/client";

// Avoid loading Prisma engine during tests
const isTestEnv =
  process.env.NODE_ENV === "test" || !!process.env.JEST_WORKER_ID;

export const prisma: any = isTestEnv ? {} : new PrismaClient();
