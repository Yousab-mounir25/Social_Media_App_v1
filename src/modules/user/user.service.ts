import { LogoutEnum } from "../../common/enum/security.enum.js";
import { ConflictException, NotFoundException } from "../../common/exception/domain.exception.js";
import { cacheService, CacheService } from "../../common/services/cache.services.js";
import { JwtPayloadType, tokenService, TokenService} from "../../common/services/token.services.js";
import { ACCESS_TOKEN_EXPIRESIN } from "../../config.js";
import { HUser } from "../../DB/model/user.model.js";
import { AcceptFriendRequestDTO, SendFriendRequestDTO } from "./DTO/user.dto.js";
import { UserRepository } from "../../common/repository/user.repository.js";
import { FriendRequestRepository } from "../../common/repository/friendRequest.repository.js";
import { IFriendRequest } from "../../common/interface/freindRequest.interface.js";
import { FriendRequestStatusEnum } from "../../common/enum/user.enum.js";



export class UserService {
    private readonly tokenService: TokenService
    private readonly cacheService:CacheService
    private readonly friendRequest : FriendRequestRepository  
    private readonly userRepository : UserRepository
    constructor(){
        this.tokenService = tokenService
        this.cacheService = cacheService
        this.friendRequest = new FriendRequestRepository()
        this.userRepository = new UserRepository()
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



async sendFriendRequest({ receiverId , note}:SendFriendRequestDTO , user:HUser):Promise<IFriendRequest>{
  
  if(receiverId.toString()== user._id.toString()){
    throw new ConflictException("you cannot send a friend request to yourself")
  }
  //check if the receiver exist
  const receiver = await this.userRepository.findOne({
    filter:{_id:receiverId}
  })
  if(!receiver){
    throw new NotFoundException("receiver is not exist")
  }
  const checkDuplicate = await this.friendRequest.findOne({
    filter:{
      senderId:{$in: [user._id , receiverId] },
      receiverId: {$in:[user._id , receiverId]}
    }
  })
  
  if(checkDuplicate){
    throw new ConflictException("Request already exists")
  }

  const request = await this.friendRequest.create({
    data:{
      senderId:user._id,
      receiverId:receiver._id,
      note
    }
  })

  return request.toJSON()

}
async acceptFriendRequest({ friendRequestId}:AcceptFriendRequestDTO , user:HUser):Promise<IFriendRequest>{
  
  const request = await this.friendRequest.findOneAndUpdate({
    filter:{
      _id:friendRequestId,
      status:FriendRequestStatusEnum.PENDING,
      receiverId:user._id
    },
    update:{
      status:FriendRequestStatusEnum.ACCEPTED
    }
  })

  if(!request){
    throw new NotFoundException("invalid request")
  }

  await Promise.all([
    this.userRepository.updateOne({
      filter:{_id:request.senderId},
      update:{
        $addToSet:{friends:request.receiverId}
      }
    }),
    this.userRepository.updateOne({
      filter:{_id:request.receiverId},
      update:{
        $addToSet:{friends:request.senderId}
      }
    }),
  ])


  return request.toJSON()

}
async cancelFriendRequest({ friendRequestId}:AcceptFriendRequestDTO , user:HUser):Promise<IFriendRequest>{
  
  const request = await this.friendRequest.findOneAndDelete({
    filter:{
      _id:friendRequestId,
      status:FriendRequestStatusEnum.PENDING,
      $or:[
        {receiverId:user._id},
        {senderId:user._id}
      ]
    },
  })

  if(!request){
    throw new NotFoundException("invalid request")
  }
  return request.toJSON()

}




}
export default new UserService()