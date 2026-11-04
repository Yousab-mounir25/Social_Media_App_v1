import { NextFunction, Request, RequestHandler, Response } from "express";
import { processMulterUpload } from "../common/utils/multer/local.multer.js";
import { validation } from './validation.middleware';

export const uploadMiddleware = ({
  isRequired = true,
  multerMiddleware,
  customPath = "general",
  validation = [],
}:{
  isRequired?:boolean , 
  multerMiddleware:RequestHandler,
  customPath?:string,
  validation:string[]
}) => {
  return async (req:Request, res:Response, next:NextFunction) => {
    multerMiddleware(req, res, async (error?:any) => {
      if (error) {
        next(new Error(error.message, { cause: { status: 400 } }));
        return;
      }
      try {
        if (isRequired && (
            !req.file &&
            !(Array.isArray(req.files) && req.files?.length) &&
            !(typeof req.files == "object" && Object.keys(req.files)?.length))) {
          next(new Error("file is required", { cause: { status: 400 } }));
          return;
        }
        await processMulterUpload({ req, customPath, validation , isRequired});
        next();
      } catch (error:any) {
        next(new Error(error.message, { cause: { status: 400 } }));
      }
    });
  };
};