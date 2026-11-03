import { HUser } from "../../DB/model/user.model.js"
import { JwtPayloadType } from "../services/token.services.js"

declare module "express-serve-static-core" {
    interface Request{
        validate:any
        user:HUser
        payload:JwtPayloadType
    }   
}