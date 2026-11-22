import mongoose from "mongoose";
import { AccountStatusEnum, GenderEnum, ProviderEnum, RoleEnum } from "../enum/user.enum.js";



export interface IUser {
        status:AccountStatusEnum,
         changeStatusAt?:Date,
        firstName: string,
        lastName: string,
        username?:string,
        email:string,
        password:string,
        phone?: String,
        friends:mongoose.Types.ObjectId[] | IUser[],
        DOB?: string,
        confirmEmail?: string,
        confirmPassword?: string,
        image?: String,
        coverImage?: [String],
        gender: GenderEnum,
        role:RoleEnum,
        provider:ProviderEnum,
        changeCredentialsTime?:Date,
        createdAt?:Date,
        updatedAt?:Date
}