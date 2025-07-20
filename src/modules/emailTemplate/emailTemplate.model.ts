import { EmailTemplate, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const createEmailTemplate = async (
  data: Prisma.EmailTemplateCreateInput
): Promise<EmailTemplate> => {
  return prisma.emailTemplate.create({ data });
};

export const updateEmailTemplate = async (
  id: number,
  data: Partial<EmailTemplate>
) => {
  return prisma.emailTemplate.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      subject: true,
      body: true,
      createdAt: true,
    },
  });
};

export const deleteEmailTemplate = async (
  id: number
): Promise<EmailTemplate> => {
  return prisma.emailTemplate.delete({ where: { id } });
};
export const findEmailTemplate = async (
  query: Prisma.EmailTemplateFindUniqueArgs
): Promise<EmailTemplate | null> => {
  return prisma.emailTemplate.findUnique(query);
};
export const findAllEmailTemplates = async (): Promise<EmailTemplate[]> => {
  return prisma.emailTemplate.findMany();
};
