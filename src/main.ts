import express from "express";
import { authenticationController } from "./modules";
import { globalErrorHandling } from "./middleware/index";
import { PORT } from "./config.js";
import { bootstrapDB } from "./DB/connection.db.js";
import { sendEmail } from "./common/utils/Email/send.email.js";
import { EmailSubjectEnum } from "./common/enum/email.enum.js";
const app = express()


bootstrapDB(app , PORT)
app.use(express.json())
app.use('/auth' , authenticationController)

sendEmail({
    subject:EmailSubjectEnum.CONFIRM_EMAIL,
    to:["yousab.mounir@gmail.com"],
    html:"Hello yousab"
})
app.all('/',(req:express.Request , res:express.Response , next:express.NextFunction):express.Response=>{
    return res.status(200).json({message:"Done"})
    
})
//if async --> return Promise<Response>
app.all('/ayHaga',async (req:express.Request , res:express.Response , next:express.NextFunction):Promise<express.Response>=>{
    return res.status(200).json({message:"Done"})
    
})
app.use(globalErrorHandling)
