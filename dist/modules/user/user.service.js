"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const security_enum_js_1 = require("../../common/enum/security.enum.js");
const domain_exception_js_1 = require("../../common/exception/domain.exception.js");
const cache_services_js_1 = require("../../common/services/cache.services.js");
const token_services_js_1 = require("../../common/services/token.services.js");
const config_js_1 = require("../../config.js");
const user_repository_js_1 = require("../../common/repository/user.repository.js");
const friendRequest_repository_js_1 = require("../../common/repository/friendRequest.repository.js");
const user_enum_js_1 = require("../../common/enum/user.enum.js");
class UserService {
    tokenService;
    cacheService;
    friendRequest;
    userRepository;
    constructor() {
        this.tokenService = token_services_js_1.tokenService;
        this.cacheService = cache_services_js_1.cacheService;
        this.friendRequest = new friendRequest_repository_js_1.FriendRequestRepository();
        this.userRepository = new user_repository_js_1.UserRepository();
    }
    async rotateToken(payload, user, issuer) {
        const accessExpiresIn = (payload.iat + config_js_1.ACCESS_TOKEN_EXPIRESIN) * 1000;
        const currentTime = Date.now() + 5 * 60000;
        if (currentTime < accessExpiresIn) {
            throw new domain_exception_js_1.ConflictException("sorry we cannot create login credential, while current access token still within valid time range");
        }
        const data = await this.tokenService.createLoginCredentials({ user, issuer });
        await this.tokenService.createRevoketoken({ payload });
        return data;
    }
    ;
    async logout(payload, user, { action = security_enum_js_1.LogoutEnum.DEVICE }) {
        switch (action) {
            case security_enum_js_1.LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.cacheService.del({ key: await this.cacheService.keys({ prefix: this.tokenService.userBaseRevokeToken({ userId: payload.sub }) }) });
                break;
            default:
                await this.tokenService.createRevoketoken({ payload });
                break;
        }
        return;
    }
    ;
    async sendFriendRequest({ receiverId, note }, user) {
        if (receiverId.toString() == user._id.toString()) {
            throw new domain_exception_js_1.ConflictException("you cannot send a friend request to yourself");
        }
        const receiver = await this.userRepository.findOne({
            filter: { _id: receiverId }
        });
        if (!receiver) {
            throw new domain_exception_js_1.NotFoundException("receiver is not exist");
        }
        const checkDuplicate = await this.friendRequest.findOne({
            filter: {
                senderId: { $in: [user._id, receiverId] },
                receiverId: { $in: [user._id, receiverId] }
            }
        });
        if (checkDuplicate) {
            throw new domain_exception_js_1.ConflictException("Request already exists");
        }
        const request = await this.friendRequest.create({
            data: {
                senderId: user._id,
                receiverId: receiver._id,
                note
            }
        });
        return request.toJSON();
    }
    async acceptFriendRequest({ friendRequestId }, user) {
        const request = await this.friendRequest.findOneAndUpdate({
            filter: {
                _id: friendRequestId,
                status: user_enum_js_1.FriendRequestStatusEnum.PENDING,
                receiverId: user._id
            },
            update: {
                status: user_enum_js_1.FriendRequestStatusEnum.ACCEPTED
            }
        });
        if (!request) {
            throw new domain_exception_js_1.NotFoundException("invalid request");
        }
        await Promise.all([
            this.userRepository.updateOne({
                filter: { _id: request.senderId },
                update: {
                    $addToSet: { friends: request.receiverId }
                }
            }),
            this.userRepository.updateOne({
                filter: { _id: request.receiverId },
                update: {
                    $addToSet: { friends: request.senderId }
                }
            }),
        ]);
        return request.toJSON();
    }
    async cancelFriendRequest({ friendRequestId }, user) {
        const request = await this.friendRequest.findOneAndDelete({
            filter: {
                _id: friendRequestId,
                status: user_enum_js_1.FriendRequestStatusEnum.PENDING,
                $or: [
                    { receiverId: user._id },
                    { senderId: user._id }
                ]
            },
        });
        if (!request) {
            throw new domain_exception_js_1.NotFoundException("invalid request");
        }
        return request.toJSON();
    }
}
exports.UserService = UserService;
exports.default = new UserService();
