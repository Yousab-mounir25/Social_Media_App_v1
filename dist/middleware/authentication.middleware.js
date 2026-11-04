"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = void 0;
const domain_exception_js_1 = require("../common/exception/domain.exception.js");
const security_enum_js_1 = require("../common/enum/security.enum.js");
const token_services_1 = require("./../common/services/token.services");
const authentication = (tokenType = security_enum_js_1.TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new domain_exception_js_1.UnAuthorizedException("Unauthorized account ");
        }
        const [key, token] = (authorization.split(" ") || []);
        console.log({ key, token });
        switch (key) {
            case "Bearer":
                const { user, payload } = await token_services_1.tokenService.decodeToken({ authorization: token, tokenType });
                req.user = user;
                req.payload = payload;
                break;
            default:
                next(new Error("invalid authentication schema", { cause: { status: 400 } }));
                break;
        }
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessRoles) => {
    return async (req, res, next) => {
        if (req.user.role < accessRoles) {
            throw new domain_exception_js_1.ForbiddenException("Forbbiden account ");
        }
        next();
    };
};
exports.authorization = authorization;
