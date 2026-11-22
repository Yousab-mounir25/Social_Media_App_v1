import { FriendRequestModel } from "../../DB/model/friendRequest.model.js";
import { IFriendRequest } from "../interface/freindRequest.interface.js";
import { DatabaseRepository } from "./base.repository.js";

export class FriendRequestRepository extends DatabaseRepository<IFriendRequest>{
    constructor(){ 
        super(FriendRequestModel)
    }
}