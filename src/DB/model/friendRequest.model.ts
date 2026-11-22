import mongoose, { HydratedDocument } from "mongoose";
import {  FriendRequestStatusEnum, } from "../../common/enum/user.enum.js";
import { IUser } from "../../common/interface/user.interface.js";
import { IFriendRequest } from "../../common/interface/freindRequest.interface.js";
const friendRequestSchema = new mongoose.Schema <IFriendRequest>(
  {
    note:{
      type:String,
      minlength:5,
      maxlength:500000
    },
    senderId:{
      type:mongoose.Types.ObjectId,
      ref:"User",
      required:true
    },
    receiverId:{
      type:mongoose.Types.ObjectId,
      ref:"User",
      required:true
    },
    status:{type:Number , default:FriendRequestStatusEnum.PENDING , enum:FriendRequestStatusEnum}
   
  },
  {
    timestamps: true,
    // collection:lw 3ayez a3'ayar el esm
    strict: false,
    validateBeforeSave: true, 
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    optimisticConcurrency: true,
  },
);
export const FriendRequestModel = mongoose.models.User || mongoose.model<IFriendRequest>("FriendRequest " , friendRequestSchema)
export type HFriendRequest = HydratedDocument<IFriendRequest>