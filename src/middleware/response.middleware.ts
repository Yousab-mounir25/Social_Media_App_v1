import { NextFunction, Request, RequestHandler, Response } from "express"
import { IResponse } from "../common/interface/success.interface.js"



export const responseFormatter = (handler:Function):RequestHandler=>{
    return async (req:Request , res:Response, next:NextFunction):Promise<Response | void>=>{
      const{
        status=201 ,
         message=true , 
         data=undefined , 
         extra= undefined}:IResponse=
           await handler(req,res,next) || {}
           return res.status(200).json({message , status , data , extra})
    }
}


