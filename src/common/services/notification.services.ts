import { App, cert, initializeApp } from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cacheService, CacheService } from "./cache.services.js";
import { toObjectId } from './../utils/objectId';
import mongoose from "mongoose";


type UserIdType= mongoose.Types.ObjectId | string
export class NotificationService{
    private client:App
    private cahceService:CacheService
    constructor(){
        this.cahceService=cacheService
        this.client=initializeApp({
            credential:cert(JSON.parse(readFileSync(resolve('./src/config/socialmediaapp-7c71f-firebase-adminsdk-fbsvc-e83cd3859f.json'))as unknown as string))
        })
    }


    key({userId}:{userId:UserIdType}){
        return `User:FCM:${userId.toString()}`
    }

    async addFCM({userId ,FCM}:{userId:UserIdType , FCM:string}){
        return this.cahceService.sAdd({key:this.key({userId}) , value:FCM})
    }
    async removeFCM({userId ,FCM}:{userId:UserIdType , FCM:string}){
        return this.cahceService.sRem({key:this.key({userId}) , value:FCM})
    }
    async getFCM({userId }:{userId:UserIdType}){
        return this.cahceService.sMembers({key:this.key({userId}) })
    }
    async hasFCM({userId }:{userId:UserIdType}){
        return this.cahceService.sCard({key:this.key({userId}) })
    }
    async removeFCMUser({userId }:{userId:UserIdType}){
        return this.cahceService.del({key:this.key({userId}) })
    }
   


    async sendNotification({
        token,
        notification
    }:{
        token:string,
        notification:{title:string , body:string , imageUrl?:string}
    }){
        return await getMessaging(this.client).send({
            token,
            notification
        })
    }
    async sendNotifications({
        tokens,
        notification
    }:{
        tokens:string[],
        notification:{title:string , body:string , imageUrl?:string}
    }){
        return await Promise.allSettled(tokens.map(token=> this.sendNotification({token,notification})))
    }
}


export const notificationService = new NotificationService()