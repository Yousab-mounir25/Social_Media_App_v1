
import mongoose from 'mongoose';
import { UserRepository } from './../repository/user.repository';
import { cacheService, CacheService } from './cache.services.js';
import { ACCESS_ADMIN_TOKEN_SIGNATURE, ACCESS_TOKEN_EXPIRESIN, ACCESS_USER_TOKEN_SIGNATURE, REFRESH_ADMIN_TOKEN_SIGNATURE, REFRESH_TOKEN_EXPIRESIN, REFRESH_USER_TOKEN_SIGNATURE } from '../../config.js';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken'
import { RoleEnum } from '../enum/user.enum.js';
import { string } from 'zod';
import { TokenTypeEnum } from '../enum/security.enum.js';
import { BadRequestException, NotFoundException, UnAuthorizedException } from '../exception/domain.exception.js';
import { toObjectId } from '../utils/objectId.js';
import { HUser } from '../../DB/model/user.model.js';
import { randomUUID } from 'node:crypto';
import { compare } from 'bcrypt';


type UserIdType = mongoose.Types.ObjectId | string
export type JwtPayloadType = JwtPayload & {
    sub:string
    aud:number[]
    jti:string
    iat:number
}



export class TokenService {


    private readonly userRepository :  UserRepository
    private readonly cacheService : CacheService

    constructor(){
        this.cacheService = cacheService
        this.userRepository = new UserRepository()
    }


userBaseRevokeToken ({ userId } :{ userId:UserIdType  } ) :string {
  return `User::${userId.toString()}::RevokeToken::`;
};

//revoke token
userRevokeToken({ userId, jti } :{ userId:UserIdType  , jti:string }):string  {
  return `${this.userBaseRevokeToken({userId})}::${jti}`;
};

//Generate token
async generateToken({
  payload ,
  options ,
  secretKey = ACCESS_USER_TOKEN_SIGNATURE,
} :{
     payload: string | Buffer | object,
     secretKey: Secret ,
     options?: SignOptions ,
}):Promise<string> {
  return await jwt.sign(payload, secretKey, options);
};



// verify token
async verifyToken ({
  token ,
  secretKey = ACCESS_USER_TOKEN_SIGNATURE,
} : {
        token: string,
        secretKey: Secret ,
}) :Promise<JwtPayloadType> {
  return await jwt.verify(token, secretKey) as JwtPayloadType 
};

//get signature according to the role
 async getTokenSignatures ({ role = RoleEnum.USER } : {role:RoleEnum}):Promise<{accessSignature:string , refreshSignature:string}>  {
  let signatures 
  switch (role) {
    case  RoleEnum.ADMIN:
      signatures = {
        accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE,
        refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE,
      };
      break;
    default:
      signatures = {
        accessSignature: ACCESS_USER_TOKEN_SIGNATURE,
        refreshSignature: REFRESH_USER_TOKEN_SIGNATURE,
      };
      break;
  }
  return signatures;
};

//return access or refresh token according to the role
async getSignature  ({
  tokenType = TokenTypeEnum.ACCESS,
  role = RoleEnum.USER,
} : {
  tokenType : TokenTypeEnum,
  role? : RoleEnum,
}) :Promise<string> {
  const signatures = await this.getTokenSignatures({ role });

  return tokenType == TokenTypeEnum.ACCESS
    ? signatures.accessSignature
    : signatures.refreshSignature;
};

//ensure that the user is authorized or not and check if the payload exist or not before enter the service
//to enter the service file with clean architecture
async decodeToken  ({
  authorization ,
  tokenType = TokenTypeEnum.ACCESS,
} : {
     authorization:string
    tokenType? : TokenTypeEnum, 
}): Promise<{user:HUser , payload:JwtPayloadType}> {
  //to see the audience and extract it to know the role of user
  const decoded = jwt.decode(authorization) as JwtPayloadType
  console.log({ authorization, decoded });

  console.log({ decoded });
  if (!decoded?.aud?.length) {
    throw new BadRequestException("missing token payload");
  }

  const payload = await this.verifyToken({
    token: authorization,
    secretKey: await this.getSignature({ tokenType, role: decoded.aud[0] as unknown as RoleEnum }),
  });
  if (!payload?.sub) {
    throw new BadRequestException("missing token payload");
  }

  if (
    await this.cacheService.exist({
      key: this.userRevokeToken({ userId: payload.sub, jti: payload.jti }),
    })
  ) {
    throw new UnAuthorizedException("Expired login credentials");
  }

  const user = await this.userRepository.findById({
    id: toObjectId(payload.sub),
    options:{lean:false}
  });
  if (!user) {
    throw new NotFoundException("invalid user ");
  }

  //check if the user change his credentials after the token issued or not
  if((user.changeCredentialsTime?.getTime() ?? 0 ) > payload.iat*1000){
    throw new UnAuthorizedException("Expired login credentials"); 
  }

  return { user, payload };
};

//we create this method because we notice that the same code are repeated in the login and rotate token API service,
// so we create this method to avoid code duplication
async createLoginCredentials ({
  user,
  issuer,
} : {
     user:HUser,
  issuer:string,
}) :Promise<{ access_token : string, refresh_token:string }>{
  const jwtid = randomUUID();
  const { accessSignature, refreshSignature } = await this.getTokenSignatures({
    role: user.role,
  });
  const access_token = await this.generateToken({
    payload: { sub: user._id },
    secretKey: accessSignature,
    options: {
      issuer,
      
      audience: [user.role as unknown as string],
      expiresIn: ACCESS_TOKEN_EXPIRESIN,
      jwtid,
    },
  });
  const refresh_token = await this.generateToken({
    payload: { sub: user._id },
    options: {
      issuer,
      
      audience: [user.role as unknown as string],
      expiresIn: REFRESH_TOKEN_EXPIRESIN,
      jwtid,
    },
    secretKey: refreshSignature,
  });

  console.log({ accessSignature, refreshSignature });

  return { access_token, refresh_token };
};

async createRevoketoken ({payload} : {payload :JwtPayloadType})  {
  const consumedTime = Math.ceil(Date.now() / 1000) - payload.iat;
  const refreshExpiresIn = payload.iat + REFRESH_TOKEN_EXPIRESIN;
  const ttl = refreshExpiresIn - consumedTime;
  // console.log({ payload, consumedTime, refreshExpiresIn, ttl });
  await this.cacheService.set({
    key: this.userRevokeToken({ userId: payload.sub, jti: payload.jti }),
    value: payload.jti,
    ttl,
  });
  return;
};

async basicAuth({email, password} : {email:string , password:string}){
    const account = await this.userRepository.findOne({filter:{email}})
    if(!account){
        throw new NotFoundException("invalid login data")
    }

    const match = await compare(password , account.password)
    if(!match){
        throw new NotFoundException("Invalid login data")
    }
    return account
}

}


export const tokenService = new TokenService();