import { NextFunction, Request, Response } from "express";
import { LanguageEnum } from "../common/enum/security.enum.js";
import { BadRequestException } from "../common/exception/domain.exception.js";
import { ZodType } from "zod";




type ValidationSchemaType =(lang:LanguageEnum)=> ZodType
export const validation = (schema:ValidationSchemaType) => {
  return (req:Request, res:Response, next:NextFunction):void => {

    const lang= Number(req.headers['accept-language'] ?? LanguageEnum.EN)
    console.log({lang})
    const validationResult = schema(lang).safeParse({
      body:req.body,
      query:req.query,
      params:req.params,
    });
    console.log({v:validationResult.data});
    
    
    if (!validationResult.success) {
      throw new BadRequestException("Validation Error", validationResult.error.issues);
    }
    req.validate = validationResult.data    
    next()
  };
};
