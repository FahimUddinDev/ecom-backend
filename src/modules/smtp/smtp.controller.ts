import { NextFunction, Request, Response } from "express";
import {
  createSmtpService,
  deleteSmtpService,
  findAllSmtpService,
  findSmtpService,
  updateSmtpService,
} from "./smtp.service";

export const createSmtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { host, password, encryption, port, userName } = req.body;
  const smtp = await createSmtpService({
    host,
    password,
    encryption,
    port,
    userName,
  });
  res.json(smtp);
};

export const updateSmtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const data = req.body;
  const updatedSmtp = await updateSmtpService(+id, data);
  res.json(updatedSmtp);
};
export const deleteSmtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  await deleteSmtpService(+id);
  res.status(204).send();
};
export const findSmtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const smtp = await findSmtpService({ where: { id: +id } });
  res.json(smtp);
};
export const findAllSmtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const smtps = await findAllSmtpService();
  res.json(smtps);
};
