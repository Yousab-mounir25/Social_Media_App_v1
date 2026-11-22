import mongoose from "mongoose";
import { AccountStatusEnum, FriendRequestStatusEnum, GenderEnum, ProviderEnum, RoleEnum } from "../enum/user.enum.js";
import { IUser } from "./user.interface.js";



export interface IFriendRequest {
        createdAt?:Date,
        updatedAt?:Date,
        senderId:mongoose.Types.ObjectId | IUser,
        receiverId:mongoose.Types.ObjectId | IUser,
        note?:string,
        status:FriendRequestStatusEnum
}