import { UserModel } from "../../DB/model/user.model.js";
import { IUser } from "../interface/user.interface.js";
import { DatabaseRepository } from "./base.repository.js";

export class UserRepository extends DatabaseRepository<IUser>{
    constructor(){ 
        super(UserModel)
    }
}