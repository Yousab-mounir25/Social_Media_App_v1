import { NextFunction, Request, Response, Router } from "express";
import { authentication } from "../../middleware/authentication.middleware.js";
import { responseFormatter } from "../../middleware/response.middleware.js";
import userService from "./user.service.js";
import { TokenTypeEnum } from "../../common/enum/security.enum.js";
import { getIssuer } from "../../common/utils/issuer.js";
import { uploadMiddleware } from "../../middleware/multer.middleware.js";
import { fileValidation, localFileUpload } from "../../common/utils/index.js";
import{StorageApproachEnum} from '../../common/enum'
const router  =Router()


router.get('/' , 
    authentication(),
    responseFormatter(
        async (req:Request , res:Response , next:NextFunction)=>{
            return {data:req.user}
        }
    )
)
router.post('/logout' , 
    authentication(),
    responseFormatter(
        async (req:Request , res:Response , next:NextFunction)=>{
            const data = await userService.logout(req.payload, req.user , req.body);
            return {data:req.user}
        }
    )
)
router.post('/rotate-token' , 
    authentication(TokenTypeEnum.REFRESH),
    responseFormatter(
        async (req:Request , res:Response , next:NextFunction)=>{
            const data = await userService.rotateToken(req.payload, req.user , getIssuer(req))
            return data
        }
    )
)
router.patch('/profile-image' , 
    authentication(),
    uploadMiddleware({
        multerMiddleware:localFileUpload({storageApproach:StorageApproachEnum.DISK}).single("attachment"),
        validation:fileValidation.files,
        customPath:"User"
    }),
    responseFormatter(
        async (req:Request , res:Response , next:NextFunction)=>{
        
            return {data:req.file}
        }
    )
)


export default router