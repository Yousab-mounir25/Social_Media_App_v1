import mongoose, { HydratedDocument, mongo } from "mongoose";
import { AccountStatusEnum, GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum/user.enum.js";
import { IUser } from "../../common/interface/user.interface.js";
import { runInThisContext } from "node:vm";
import { hash } from "../../common/security/hash.security.js";
import { decryption, encryption } from "../../common/security/encryption.security.js";
const userSchema = new mongoose.Schema <IUser>(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: function():boolean{
        return this.provider == ProviderEnum.SYSTEM
      },
    },
    friends:[{type:mongoose.Types.ObjectId , ref:"User"}],
    phone: String,
    DOB: Date,
    confirmEmail: Date,
    image: String,
    coverImage: [String],
    gender: {
      type: Number,
      enum: GenderEnum,
      default: GenderEnum.MALE,
    },
    role: {
      type: Number,
      enum: RoleEnum,
      default: RoleEnum.USER,
    },
    provider: {
      type: Number,
      enum: ProviderEnum,
      default: ProviderEnum.SYSTEM,
    },
    changeCredentialsTime:Date,
    status:{
      type:Number,
      enum:AccountStatusEnum,
      default:AccountStatusEnum.ACTIVE
    },
    changeStatusAt:Date,
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

userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });



// userSchema.pre('save',function(){
//   console.log("pre-one")
//   console.log(this);
  
// })

// userSchema.post('save', function(doc){
//   console.log("post-one")
//   console.log(doc);
  
// })
// userSchema.post('save',function(doc){
//   console.log("post-two")
  
// })

userSchema.pre('validate' , function(){
  if(this.provider == ProviderEnum.GOOGLE && this.password){
    throw new Error("Google account cannot hold password")
  }
})
userSchema.pre('save' ,async function(this:HUser &{wasNew:boolean}){
  //  console.log(this.modifiedPaths())
  //  console.log(this.isDirectModified("extra.name"))

  this.wasNew = this.isNew
  if(this.isModified("password")){
    this.password = await hash(this.password)
  }
  if(this.isModified("phone")){
    this.phone =await encryption(this.phone as string)
  }
  
  
 
})

userSchema.post('save',async function(doc){
  doc.phone= await decryption(this.phone as string)
//  console.log( {p:(this as HUser & {wasNew:boolean}).wasNew})
})


// userSchema.pre('updateOne' ,{document:true , query:false} ,function(){
//   console.log(this)
// })



userSchema.pre(['findOne' , 'find' , 'countDocuments'] , function(){
  //paranoid ---> di haga ana hab3atha fi el query beta3ty zi hint kda 3ashan a3raf ana 3ayez el archived wla la
  const query =this.getFilter() //Gets the conditions that you passed to findOne().
  if(query.paranoid==false){ //a custom query property that you are using to control whether archived users should appear in the results or not.
    this.setQuery({...query}) /// if false --> allow archived user to appear
  }else{
    this.setQuery({...query , status:{$ne:AccountStatusEnum.ARCHIVE}}) // if true--> dont return archived users
  }
  console.log({post:this.getFilter()})
  
})


userSchema.pre(['updateOne' , 'updateMany' , 'findOneAndUpdate'] , function(){
  //paranoid ---> di haga ana hab3atha fi el query beta3ty zi hint kda 3ashan a3raf ana 3ayez el archived wla la
  const query =this.getFilter() //Gets the conditions that you passed to findOne().
  const update = this.getUpdate() as HUser

    if(update.status == AccountStatusEnum.ACTIVE){
      this.setQuery({...query , status:{$eq:AccountStatusEnum.ARCHIVE}})
    }else if(update.status == AccountStatusEnum.ARCHIVE){
      this.setQuery({...query , status:{$ne:AccountStatusEnum.ARCHIVE}})
    }

    if(!update.status && query.paranoid !=false){
      this.setQuery({...query , status:{$ne:AccountStatusEnum.ARCHIVE}})
    }

  this.setUpdate({
    ...update,
    ...(update.status ? {changeStatusAt:new Date()} : {})
  })
  
})
userSchema.pre(['deleteOne' , 'deleteMany' , 'findOneAndDelete'] , function(){
  //paranoid ---> di haga ana hab3atha fi el query beta3ty zi hint kda 3ashan a3raf ana 3ayez el archived wla la
  const query =this.getFilter() //Gets the conditions that you passed to findOne().

   if(!query.force){// if true --> delete the user from the database
     this.setQuery({...query , status:{$eq:AccountStatusEnum.ARCHIVE}}) //you cant delete the user if he is not archived
   } 
})

userSchema.pre('insertMany',function(docs:HUser[]){
  console.log(this);
  
})


export const UserModel = mongoose.models.User || mongoose.model<IUser>("User" , userSchema)
export type HUser = HydratedDocument<IUser>