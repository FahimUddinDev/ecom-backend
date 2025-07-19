import { Prisma, Smtp } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const createSmtp = async (
  data: Prisma.SmtpCreateInput
): Promise<Smtp> => {
  return prisma.smtp.create({ data });
};

export const updateSmtp = async (id: number, data: Partial<Smtp>) => {
  return prisma.smtp.update({
    where: { id },
    data,
    select: {
      id: true,
      host: true,
      password: true,
      encryption: true,
      port: true,
      userName: true,
    },
  });
};

export const deleteSmtp = async (id: number): Promise<Smtp> => {
  return prisma.smtp.delete({ where: { id } });
};
export const findSmtp = async (
  query: Prisma.SmtpFindUniqueArgs
): Promise<Smtp | null> => {
  return prisma.smtp.findUnique(query);
};
export const findAllSmtp = async () => {
  return prisma.smtp.findMany();
};
