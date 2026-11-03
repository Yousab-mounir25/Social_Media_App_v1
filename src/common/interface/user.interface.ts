import { GenderEnum, ProviderEnum, RoleEnum } from "../enum/user.enum.js";



export interface IUser {
     firstName: string,
        lastName: string,
        username?:string,
        email:string,
        password:string,
        phone?: String,
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