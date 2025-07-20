import { EmailTemplate, Prisma } from "@prisma/client";
import * as emailTemplateModel from "./emailTemplate.model";

export const createEmailTemplate = async ({
  name,
  subject,
  body,
}: Prisma.EmailTemplateCreateInput): Promise<EmailTemplate> => {
  const existingTemplate = await emailTemplateModel.findEmailTemplate({
    where: { name },
  });
  if (existingTemplate) {
    throw new Error(`Email template with name "${name}" already exists.`);
  }
  return emailTemplateModel.createEmailTemplate({
    name,
    subject,
    body,
  });
};
export const updateEmailTemplate = async (
  id: number,
  data: Partial<{
    name: string;
    subject: string;
    body: string;
  }>
): Promise<EmailTemplate | null> => {
  return emailTemplateModel.updateEmailTemplate(id, data);
};
export const deleteEmailTemplate = async (
  id: number
): Promise<EmailTemplate | null> => {
  return emailTemplateModel.deleteEmailTemplate(id);
};
export const findEmailTemplate = async (
  query: number | string
): Promise<EmailTemplate | null> => {
  let where: Prisma.EmailTemplateWhereUniqueInput;
  if (typeof query === "number") {
    where = { id: query };
  } else if (!isNaN(Number(query))) {
    // If string looks like a number, treat it as ID
    where = { id: Number(query) };
  } else {
    where = { name: query };
  }
  console.log("Finding email template with where:", where);
  return emailTemplateModel.findEmailTemplate({ where });
};
export const findAllEmailTemplates = async (): Promise<EmailTemplate[]> => {
  return emailTemplateModel.findAllEmailTemplates();
};
