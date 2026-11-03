import { ConfirmEmailDto, LoginDto, ResendConfirmEmailDto, SignupDto } from "./DTO/authentication.dto.js";
import { IUser } from "../../common/interface/user.interface.js";
import { HUser, UserModel } from "../../DB/model/user.model.js";
import { BadRequestException, ConflictException, NotFoundException, TooManyRequestException } from "../../common/exception/domain.exception.js";
import { Model } from "mongoose";
import { UserRepository } from './../../common/repository/user.repository';
import {cacheService, CacheService } from './../../common/services/cache.services';
import { compare, hash } from "../../common/security/hash.security.js";
import { userEmailKey, userEmailTrialsKey } from "../../common/utils/Email/send.email.js";
import { EmailSubjectEnum } from "../../common/enum/email.enum.js";
import { emailEvent } from "../../common/utils/Email/email.event.js";
import { createOtp } from './../../common/utils/index.js';
import { encryption } from "../../common/security/encryption.security.js";
import { ProviderEnum } from "../../common/enum/user.enum.js";
import { tokenService, TokenService } from './../../common/services/token.services';
import { ILoginResponse } from "./entities/auth.entities.js";

export class AuthenticationService {

  private userRepository :UserRepository
  private cacheService:CacheService
  private tokenService:TokenService
  constructor() {
    this.cacheService = cacheService
    this.userRepository = new UserRepository()
    this.tokenService = tokenService
  }
  // signup = async ({username , email , password , confirmPassword}: SignupDto['body']): Promise<any> => {
  //   const user =await this.userRepository.findOne({
  //     filter:{email},
  //     options:{skip:1},
  //     projection:{email:1}
  //   })
  //   if(user){
  //     throw new ConflictException("User already exist")
  //   }
  //   const account:HUser[] = await this.userRepository.create({
  //     data:[{
  //       username ,
  //        email ,
  //         password: await hash(password) , 
  //         confirmPassword
  //     }],
      
  //   })
  //   return account
  // };


  

async sendEmailOtp ({ email, subject , expiresIn=120 , maxTrials=3 , blockIn=300} : { email:string, subject:EmailSubjectEnum , expiresIn?:number , maxTrials?:number , blockIn?:number}){
  const existOtp_ttl = await this.cacheService.ttl({key: userEmailKey({ email, subject })})
  if(existOtp_ttl>0){
    throw new ConflictException(`sorry we cannot create otp while the old one still valid, please try again after ${existOtp_ttl}`)
  }
  const oldTrials = await this.cacheService.get({key:userEmailTrialsKey({email,subject})}) ?? 0
  if(oldTrials >=maxTrials){
    throw new TooManyRequestException("Max otp trials has been reached")
  }
 
  const code = createOtp();
  await this.cacheService.set({
    key: userEmailKey({ email, subject }),
    value: await hash(  code.toString() ), //convert the otp to string before hashing it
    ttl: expiresIn,
  });

  const currentTrials=await this.cacheService.incrBy({key:userEmailTrialsKey({email,subject})})
  //when the user reached the trial number 3 ---> block his account for 5 mins
  if(currentTrials == 3){
    await this.cacheService.expire({key:userEmailTrialsKey({email,subject}) , ttl:blockIn}) //5*60 =300sec
  }
  emailEvent.emit("sendEmail", {
    recipient: { to: email },
    subject: EmailSubjectEnum.CONFIRM_EMAIL,
    data: { code },
  });
};

async signup (inputs : SignupDto['body']) :Promise<IUser> {
  const { username, email, password, phone } = inputs;
  const existingUser = await this.userRepository.findOne({
    filter: { email }
  });
  if (existingUser) {
    throw new ConflictException("Email exist");
  }
  const user = await this.userRepository.createOne({
    data: {
      username,
      email,
      password: await hash(  password ), //hash the password before saving to the database
      phone: await encryption(phone), //encrypt the phone number before saving to the database
    },
  });

 await this.sendEmailOtp({email , subject:EmailSubjectEnum.CONFIRM_EMAIL})

  return user;
};



  async confirmEmail (inputs:ConfirmEmailDto):Promise<void>{
  const { otp, email } = inputs;
  const account = await this.userRepository.findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: false },
    },

  });
  if (!account) {
    throw new NotFoundException("Invalid email or account already confirmed");
  }

  const hashOtp = await this.cacheService.get({
    key: userEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }),
  });

  if (!hashOtp || !(await compare(otp.toString(), hashOtp))) {
    //ttl is expired or the otp is not match with the hashed otp
    throw new BadRequestException("Invalid OTP");
  }

  account.confirmEmail = new Date() as unknown as string;
  await account?.save();
  await this.cacheService.del({
    key: await this.cacheService.keys({prefix:userEmailKey({email,subject:EmailSubjectEnum.CONFIRM_EMAIL})}),
  }); //delete the otp from redis after confirming the email
  return;
};

// resend confirm email again
async resendConfirmEmail  (inputs:ResendConfirmEmailDto):Promise<void> {
  const { email } = inputs;
  const account = await this.userRepository.findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: false },
    },
    options: { select: "email" },
    
  });
  if (!account) {
    throw new NotFoundException("Invalid email or account already confirmed");
  }

  await this.sendEmailOtp({email,subject:EmailSubjectEnum.CONFIRM_EMAIL})
  return;
};

 async login  (inputs:LoginDto, issuer:string):Promise<ILoginResponse> {
  const { email, password } = inputs;
  const account = await this.userRepository.findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confrimEmail: { $exists: true },
    },
  });
  if (!account) {
    throw new NotFoundException("invalid login credentials"); // check for email
  }
  const match = await compare(password, account.password); //check for password
  if (!match) {
    throw new NotFoundException("invalid login credentials");
  }
  return await this.tokenService.createLoginCredentials({ user: account, issuer });
};



}

export default new AuthenticationService()