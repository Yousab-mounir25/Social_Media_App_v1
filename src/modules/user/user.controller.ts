import { NextFunction, Request, Response, Router } from "express";
import { authentication } from "../../middleware/authentication.middleware.js";
import { responseFormatter } from "../../middleware/response.middleware.js";
import userService from "./user.service.js";
import { TokenTypeEnum } from "../../common/enum/security.enum.js";
import { getIssuer } from "../../common/utils/issuer.js";
import { uploadMiddleware } from "../../middleware/multer.middleware.js";
import { fileValidation, localFileUpload } from "../../common/utils/index.js";
import{StorageApproachEnum} from '../../common/enum'
import * as validators from './user.validation.js'
import { validation } from "../../middleware/validation.middleware.js";
import { IResponse } from "../../common/interface/success.interface.js";
import { IFriendRequest } from "../../common/interface/freindRequest.interface.js";
import { AcceptFriendRequestDTO } from "./DTO/user.dto.js";
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

router.post('/send-friend-request' , 
    authentication(),
    validation(validators.sendFriendRequest),
    responseFormatter(
        async (req:Request , res:Response , next:NextFunction):Promise<IResponse<IFriendRequest>>=>{
            const request = await userService.sendFriendRequest(req.body, req.user)
            return {data:request}
        }
    )
)
router.patch('/accept-friend-request/:friendRequestId' , 
    authentication(),
    validation(validators.acceptFriendRequest),
    responseFormatter(
        async (req:Request , res:Response , next:NextFunction):Promise<IResponse<IFriendRequest>>=>{
            const request = await userService.acceptFriendRequest(req.params as AcceptFriendRequestDTO, req.user)
            return {data:request}
        }
    )
)
router.patch('/cancel-friend-request/:friendRequestId' , 
    authentication(),
    validation(validators.acceptFriendRequest),
    responseFormatter(
        async (req:Request , res:Response , next:NextFunction):Promise<IResponse<IFriendRequest>>=>{
            const request = await userService.cancelFriendRequest(req.params as AcceptFriendRequestDTO, req.user)
            return {data:request}
        }
    )
)


export default router