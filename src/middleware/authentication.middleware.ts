import { NextFunction, Request, Response } from "express";
import { ForbiddenException, UnAuthorizedException } from "../common/exception/domain.exception.js";
import { TokenTypeEnum } from "../common/enum/security.enum.js";
import { tokenService } from './../common/services/token.services';
import { RoleEnum } from "../common/enum/user.enum.js";


export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
  return async (req:Request, res:Response, next:NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new UnAuthorizedException("Unauthorized account ");
    }
    //Bearer token
    const [key, token] = (authorization.split(" ") || []) as [string , string];
    console.log({ key, token });

    switch (key) {
      // case "Basic":
      //   const [email,password] = Buffer.from(token, "base64").toString().split(":");
      //   // console.log({ email , password });
      //   break;
      case "Bearer":
        const { user, payload } = await tokenService.decodeToken({authorization:token ,tokenType});
        req.user = user
        req.payload = payload
        break;
      default:
        next(new Error("invalid authentication schema" ,{cause:{status:400}}))
        break;
    }
    next();
  };
};

//===================== AUTHORIZATION ============================

// export const authorization = (accessRole) => {
//   return async (req, res, next) => {
//     if (req.user.role < accessRole) {
//       throw ForbiddenException("Forbbiden account ");
//     }
//     next();
//   };
// };


//send an array to the function with the allowed roles to use a specific endpoint
export const authorization = (accessRoles:RoleEnum) => {
  return async (req:Request, res:Response, next:NextFunction) => {
    // if (!accessRoles.includes(req.user.role)) {
    //   throw new ForbiddenException("Forbbiden account ");
    // }

    if(req.user.role < accessRoles){
      throw new ForbiddenException("Forbbiden account ");
    }

    next();
  };
};
