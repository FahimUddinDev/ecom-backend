// Validate middleware
import { NextFunction, Request, Response } from "express";
import { AnySchema } from "yup";

export const validate =
  (schema: { body: AnySchema }) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.body.validate(req.body, { abortEarly: false });
      next();
    } catch (err: any) {
      if (err.name === "ValidationError" && err.inner) {
        const errorObj: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          if (e.path) errorObj[e.path] = e.message;
        });
        return res.status(400).json(errorObj);
      }
      res.status(400).json({ error: err.message });
    }
  };
