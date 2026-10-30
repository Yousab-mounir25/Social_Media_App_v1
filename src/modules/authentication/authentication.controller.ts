import { NextFunction, Request, Response, Router } from "express";
import authService from "./authentication.service.js";
import { responseFormatter } from "../../middleware/response.middleware.js";
import { IResponse } from "../../common/interface/success.interface.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from './authentication.validation.js'
import { IUser } from "../../common/interface/user.interface.js";
const router = Router()

// router.post('/signup' , async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
//     const data = await authService.signup(req.body)
//     return successResponse({res , status:201})
// })
router.post('/signup' , 
    // validation(validators.signup),
    responseFormatter(
    async(req:Request,res:Response,next:NextFunction):Promise<IResponse<IUser>>=>{
        const data = await authService.signup(req.body)
        return {data , status:201}
    }
)
)

router.patch("/confirm-email" ,
    validation(validators.confirmEmail),
    responseFormatter(
        async(req:Request , res:Response , next:NextFunction)=>{
            return await authService.confirmEmail(req.body);
            
        }
    )
)
router.patch("/resend-confirm-email" ,
    validation(validators.resendConfirmEmail),
    responseFormatter(
        async(req:Request , res:Response , next:NextFunction)=>{
            return await authService.resendConfirmEmail(req.body);
            
        }
    )
)





export default router;