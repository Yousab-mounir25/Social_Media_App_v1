"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_js_1 = require("../../middleware/authentication.middleware.js");
const response_middleware_js_1 = require("../../middleware/response.middleware.js");
const user_service_js_1 = __importDefault(require("./user.service.js"));
const security_enum_js_1 = require("../../common/enum/security.enum.js");
const issuer_js_1 = require("../../common/utils/issuer.js");
const router = (0, express_1.Router)();
router.get('/', (0, authentication_middleware_js_1.authentication)(), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    return { data: req.user };
}));
router.post('/logout', (0, authentication_middleware_js_1.authentication)(), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_js_1.default.logout(req.payload, req.user, req.body);
    return { data: req.user };
}));
router.post('/rotate-token', (0, authentication_middleware_js_1.authentication)(security_enum_js_1.TokenTypeEnum.REFRESH), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_js_1.default.rotateToken(req.payload, req.user, (0, issuer_js_1.getIssuer)(req));
    return data;
}));
exports.default = router;
