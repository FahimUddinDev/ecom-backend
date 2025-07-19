import { Prisma } from "@prisma/client";
import {
  createSmtp,
  deleteSmtp,
  findAllSmtp,
  findSmtp,
  updateSmtp,
} from "./smtp.model";

export const createSmtpService = async ({
  host,
  password,
  encryption,
  port,
  userName,
}: Prisma.SmtpCreateInput) => {
  return createSmtp({
    host,
    password,
    encryption,
    port,
    userName,
  });
};

export const updateSmtpService = async (
  id: number,
  data: Partial<{
    host: string;
    password: string;
    encryption: string;
    port: number;
    userName: string;
  }>
) => {
  return updateSmtp(id, data);
};
export const deleteSmtpService = async (id: number) => {
  return deleteSmtp(id);
};
export const findSmtpService = async (query: Prisma.SmtpFindUniqueArgs) => {
  return findSmtp(query);
};
export const findAllSmtpService = async () => {
  return findAllSmtp();
};
