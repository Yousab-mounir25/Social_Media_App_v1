"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const user_repository_1 = require("./../repository/user.repository");
const cache_services_js_1 = require("./cache.services.js");
const config_js_1 = require("../../config.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_enum_js_1 = require("../enum/user.enum.js");
const security_enum_js_1 = require("../enum/security.enum.js");
const domain_exception_js_1 = require("../exception/domain.exception.js");
const objectId_js_1 = require("../utils/objectId.js");
const node_crypto_1 = require("node:crypto");
const bcrypt_1 = require("bcrypt");
class TokenService {
    userRepository;
    cacheService;
    constructor() {
        this.cacheService = cache_services_js_1.cacheService;
        this.userRepository = new user_repository_1.UserRepository();
    }
    userBaseRevokeToken({ userId }) {
        return `User::${userId.toString()}::RevokeToken::`;
    }
    ;
    userRevokeToken({ userId, jti }) {
        return `${this.userBaseRevokeToken({ userId })}::${jti}`;
    }
    ;
    async generateToken({ payload, options, secretKey = config_js_1.ACCESS_USER_TOKEN_SIGNATURE, }) {
        return await jsonwebtoken_1.default.sign(payload, secretKey, options);
    }
    ;
    async verifyToken({ token, secretKey = config_js_1.ACCESS_USER_TOKEN_SIGNATURE, }) {
        return await jsonwebtoken_1.default.verify(token, secretKey);
    }
    ;
    async getTokenSignatures({ role = user_enum_js_1.RoleEnum.USER }) {
        let signatures;
        switch (role) {
            case user_enum_js_1.RoleEnum.ADMIN:
                signatures = {
                    accessSignature: config_js_1.ACCESS_ADMIN_TOKEN_SIGNATURE,
                    refreshSignature: config_js_1.REFRESH_ADMIN_TOKEN_SIGNATURE,
                };
                break;
            default:
                signatures = {
                    accessSignature: config_js_1.ACCESS_USER_TOKEN_SIGNATURE,
                    refreshSignature: config_js_1.REFRESH_USER_TOKEN_SIGNATURE,
                };
                break;
        }
        return signatures;
    }
    ;
    async getSignature({ tokenType = security_enum_js_1.TokenTypeEnum.ACCESS, role = user_enum_js_1.RoleEnum.USER, }) {
        const signatures = await this.getTokenSignatures({ role });
        return tokenType == security_enum_js_1.TokenTypeEnum.ACCESS
            ? signatures.accessSignature
            : signatures.refreshSignature;
    }
    ;
    async decodeToken({ authorization, tokenType = security_enum_js_1.TokenTypeEnum.ACCESS, }) {
        const decoded = jsonwebtoken_1.default.decode(authorization);
        console.log({ authorization, decoded });
        console.log({ decoded });
        if (!decoded?.aud?.length) {
            throw new domain_exception_js_1.BadRequestException("missing token payload");
        }
        const payload = await this.verifyToken({
            token: authorization,
            secretKey: await this.getSignature({ tokenType, role: decoded.aud[0] }),
        });
        if (!payload?.sub) {
            throw new domain_exception_js_1.BadRequestException("missing token payload");
        }
        if (await this.cacheService.exist({
            key: this.userRevokeToken({ userId: payload.sub, jti: payload.jti }),
        })) {
            throw new domain_exception_js_1.UnAuthorizedException("Expired login credentials");
        }
        const user = await this.userRepository.findById({
            id: (0, objectId_js_1.toObjectId)(payload.sub),
            options: { lean: false }
        });
        if (!user) {
            throw new domain_exception_js_1.NotFoundException("invalid user ");
        }
        if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
            throw new domain_exception_js_1.UnAuthorizedException("Expired login credentials");
        }
        return { user, payload };
    }
    ;
    async createLoginCredentials({ user, issuer, }) {
        const jwtid = (0, node_crypto_1.randomUUID)();
        const { accessSignature, refreshSignature } = await this.getTokenSignatures({
            role: user.role,
        });
        const access_token = await this.generateToken({
            payload: { sub: user._id },
            secretKey: accessSignature,
            options: {
                issuer,
                audience: [user.role],
                expiresIn: config_js_1.ACCESS_TOKEN_EXPIRESIN,
                jwtid,
            },
        });
        const refresh_token = await this.generateToken({
            payload: { sub: user._id },
            options: {
                issuer,
                audience: [user.role],
                expiresIn: config_js_1.REFRESH_TOKEN_EXPIRESIN,
                jwtid,
            },
            secretKey: refreshSignature,
        });
        console.log({ accessSignature, refreshSignature });
        return { access_token, refresh_token };
    }
    ;
    async createRevoketoken({ payload }) {
        const consumedTime = Math.ceil(Date.now() / 1000) - payload.iat;
        const refreshExpiresIn = payload.iat + config_js_1.REFRESH_TOKEN_EXPIRESIN;
        const ttl = refreshExpiresIn - consumedTime;
        await this.cacheService.set({
            key: this.userRevokeToken({ userId: payload.sub, jti: payload.jti }),
            value: payload.jti,
            ttl,
        });
        return;
    }
    ;
    async basicAuth({ email, password }) {
        const account = await this.userRepository.findOne({ filter: { email } });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("invalid login data");
        }
        const match = await (0, bcrypt_1.compare)(password, account.password);
        if (!match) {
            throw new domain_exception_js_1.NotFoundException("Invalid login data");
        }
        return account;
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
