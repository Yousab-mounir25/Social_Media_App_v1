import express from "express";
import { authenticationController } from "./modules";
import { globalErrorHandling } from "./middleware/index";
import { PORT } from "./config.js";
import { bootstrapDB } from "./DB/connection.db.js";
import { userController } from "./modules/user/index.js";
import cors from 'cors'
import { HUser, UserModel } from "./DB/model/user.model.js";
import { GenderEnum, ProviderEnum } from "./common/enum/user.enum.js";
import { UserRepository } from "./common/repository/user.repository.js";
import { toObjectId } from "./common/utils/objectId.js";
import { notificationService } from "./common/services/notification.services.js";
const app = express()


bootstrapDB(app , PORT)
app.use('/assets'  , express.static('./assets'))
app.use(cors(),express.json())
app.use('/auth' , authenticationController)
app.use('/user' , userController)


app.all('/',(req:express.Request , res:express.Response , next:express.NextFunction):express.Response=>{
    return res.status(200).json({message:"Done"})
    
})
//if async --> return Promise<Response>
app.all('/ayHaga',async (req:express.Request , res:express.Response , next:express.NextFunction):Promise<express.Response>=>{
    return res.status(200).json({message:"Done"})
    
})
// app.post('/send-notification',async (req:express.Request , res:express.Response , next:express.NextFunction):Promise<express.Response>=>{
//     const token = req.body.token
//     await notificationService.sendNotification({
//         token,
//         notification:{
//             title:"Test8000",
//             body:"ay hagaaaa"
//         }
//     })
//     console.log({token});
    
//     return res.status(200).json({message:"Done"})
    
// })
app.use(globalErrorHandling)

// async function test(){
//     // const user =new UserModel({
//     //     extra:{
//     //         name:"ALiiii"
//     //     },
//     //     firstName:"yous",
//     //     lastName:"mounir",
//     //     email:`${Date.now()}@gamil.com`,
//     //     password:"shssjjs",
//     //     phone:"0122222293939"
//     // })
//     // await user.save()
//     // user.password="1234"
//     // user.extra.name="yousabbbbb"
//     // await user.save()
//     // await user.save()

//     const userModel = new UserRepository()
//     // const user = await userModel.findOne({
//     //     filter:{
//     //         paranoid:false
//     //     },
    
//     // }) as HUser
//     // const user = await userModel.updateOne({
//     //     filter:{
//     //        _id:toObjectId("6aeb9379abd5d33707a478c2")
//     //     },
//     //     update:{
//     //         gender:GenderEnum.FEMALE
//     //     }
    
//     // }) 
//     // const user = await userModel.deleteOne({
//     //     filter:{
//     //        _id:toObjectId("6af58b1ddd2413bd068313c3"),
//     //        force:true

//     //     }
//     // }) 
//     const user = await userModel.insertMany({
//         data:[{
//             firstName:"yous",
//             lastName:"mounir",
//             email:`${Date.now()}@gamil.com`,
//             password:"shssjjs",
//             phone:"0122222293939"
//         }]
//     }) 

//     console.log(user);
    


// }
// test()