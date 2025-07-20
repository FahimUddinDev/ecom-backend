import { NextFunction, Request, Response } from "express";
import * as emailTemplateService from "./emailTemplate.service";

export const createEmailTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, subject, body } = req.body;
  const emailTemplate = await emailTemplateService.createEmailTemplate({
    name,
    subject,
    body,
  });
  res.json(emailTemplate);
};

export const updateEmailTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const data = req.body;
  const updatedEmailTemplate = await emailTemplateService.updateEmailTemplate(
    +id,
    data
  );
  res.json(updatedEmailTemplate);
};
export const deleteEmailTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  await emailTemplateService.deleteEmailTemplate(+id);
  res.status(204).send();
};
export const findEmailTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const emailTemplate = await emailTemplateService.findEmailTemplate(id);
  res.json(emailTemplate);
};
export const findAllEmailTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const emailTemplates = await emailTemplateService.findAllEmailTemplates();
  res.json(emailTemplates);
};
