import express from "express";
import { authenticationController } from "./modules";
import { globalErrorHandling } from "./middleware/index";
import { PORT } from "./config.js";
import { bootstrapDB } from "./DB/connection.db.js";
import { userController } from "./modules/user/index.js";
import cors from 'cors'
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
app.use(globalErrorHandling)
