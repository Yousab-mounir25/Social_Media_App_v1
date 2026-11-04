"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const security_enum_js_1 = require("../../common/enum/security.enum.js");
const domain_exception_js_1 = require("../../common/exception/domain.exception.js");
const cache_services_js_1 = require("../../common/services/cache.services.js");
const token_services_js_1 = require("../../common/services/token.services.js");
const config_js_1 = require("../../config.js");
class UserService {
    tokenService;
    cacheService;
    constructor() {
        this.tokenService = token_services_js_1.tokenService;
        this.cacheService = cache_services_js_1.cacheService;
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
}
exports.UserService = UserService;
exports.default = new UserService();
