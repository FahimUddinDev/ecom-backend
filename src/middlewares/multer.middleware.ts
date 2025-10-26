import { NextFunction, Request, Response } from "express";
import multer from "multer";

// Disk storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const multerInstance = multer({ storage });

export const handleUpload = (fields: { [field: string]: number }) => {
  const multerFields = Object.entries(fields).map(([name, maxCount]) => ({
    name,
    maxCount,
  }));

  const middleware = multerInstance.fields(multerFields);

  return (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err: any) => {
      if (err) return next(err);

      for (const fieldName in fields) {
        const uploadedFiles = (req.files as any)?.[fieldName];

        if (uploadedFiles && Array.isArray(uploadedFiles)) {
          const publicPaths = uploadedFiles.map(
            (file: Express.Multer.File) => `/public/${file.filename}`
          );
          req.body[fieldName] =
            fields[fieldName] === 1 ? publicPaths[0] : publicPaths;
        }
      }

      next();
    });
  };
};
