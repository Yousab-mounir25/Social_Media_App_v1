import { ConfirmEmailDto, LoginDto, ResendConfirmEmailDto, SignupDto } from "./DTO/authentication.dto.js";
import { IUser } from "../../common/interface/user.interface.js";
import { HUser, UserModel } from "../../DB/model/user.model.js";
import { BadRequestException, ConflictException, NotFoundException, TooManyRequestException, UnAuthorizedException } from "../../common/exception/domain.exception.js";
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
import { ILoginResponse, ISignupWithGoogle } from "./entities/auth.entities.js";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { WEB_CLIENT_IDS } from "../../config.js";

export class AuthenticationService {

  private userRepository :UserRepository
  private cacheService:CacheService
  private tokenService:TokenService
  private client :OAuth2Client
  constructor() {
    this.cacheService = cacheService
    this.userRepository = new UserRepository()
    this.tokenService = tokenService
    this.client = new OAuth2Client()
  }
  async verifyGoogleAccount(idToken:string):Promise<TokenPayload> {
  let ticket;
  try {
    ticket = await this.client.verifyIdToken({
      idToken,
      audience: WEB_CLIENT_IDS, // Specify the CLIENT_ID of the app that accesses the backend
    });
  } catch (error) {
    throw new UnAuthorizedException("invalid google token");
  }
  const payload = ticket.getPayload();
  if (!payload?.email_verified) {
    throw new BadRequestException("not verified email");
  }
  return payload;
}

// export const loginWithGoogle = async (user, issuer) => {
//   return await createLoginCredentials({user:existingUser ,issuer})
// }

 async signupWithGmail({ idToken}:{idToken:string}, issuer:string ):Promise<ISignupWithGoogle>  {
  //after i receive the idToken from the frontend
  //I talked to google to verify the token , then i receive from google the payload that contain the data
  const { email, name, picture } = await this.verifyGoogleAccount(idToken);
  const existAccount = await this.userRepository.findOne({
    filter: { email:email as string},
  });
  if (existAccount) {
    if (existAccount.provider != ProviderEnum.GOOGLE) {
      throw new ConflictException("invalid account provider");
    }
    //login wit google
    return {
      status: 200,
      data: await this.tokenService.createLoginCredentials({ user: existAccount, issuer }),
    };
  }
  
  //if not exist --> add user
  const user = await this.userRepository.create({
    data: {
      email,
      username: name,
      image: picture,
      confirmEmail: new Date(),
      provider: ProviderEnum.GOOGLE,
    },
  });
  return {
    status: 201,
    data: await this.tokenService.createLoginCredentials({ user  , issuer }),
  };
};

  

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