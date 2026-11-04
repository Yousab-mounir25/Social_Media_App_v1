import { LogoutEnum } from "../../common/enum/security.enum.js";
import { ConflictException } from "../../common/exception/domain.exception.js";
import { cacheService, CacheService } from "../../common/services/cache.services.js";
import { JwtPayloadType, tokenService, TokenService} from "../../common/services/token.services.js";
import { ACCESS_TOKEN_EXPIRESIN } from "../../config.js";
import { HUser } from "../../DB/model/user.model.js";



export class UserService {
    private readonly tokenService: TokenService
    private readonly cacheService:CacheService
    constructor(){
        this.tokenService = tokenService
        this.cacheService = cacheService
    }


    async rotateToken (payload:JwtPayloadType, user:HUser , issuer:string ) {
  const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRESIN) * 1000; //to ms
  const currentTime = Date.now() + 5 * 60000; //plus 5 mins in ms
  if (currentTime < accessExpiresIn) {
    throw new ConflictException(
      "sorry we cannot create login credential, while current access token still within valid time range",
    );
  }

  const data=  await this.tokenService.createLoginCredentials({ user,issuer });
  await this.tokenService.createRevoketoken({payload})
  return data
};

async logout (payload:JwtPayloadType, user:HUser , {action=LogoutEnum.DEVICE}:{action:LogoutEnum}) {
  switch (action) {
    case LogoutEnum.ALL:
      user.changeCredentialsTime=new Date()
      await user.save()
      await this.cacheService.del({key:await this.cacheService.keys({prefix:this.tokenService.userBaseRevokeToken({userId:payload.sub})})})
      break;
    default:
       await this.tokenService.createRevoketoken({payload})
      break;
  }
 return
};
}
export default new UserService()