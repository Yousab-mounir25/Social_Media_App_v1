import { NextFunction, Request, Response, Router } from "express";
import { authentication } from "../../middleware/authentication.middleware.js";
import { responseFormatter } from "../../middleware/response.middleware.js";

const router  =Router()


router.get('/' , 
    authentication(),
    responseFormatter(
        async (req:Request , res:Response , next:NextFunction)=>{
            return {data:req.user}
        }
    )
)


export default router