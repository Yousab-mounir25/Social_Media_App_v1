"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const multer_middleware_js_1 = require("../../middleware/multer.middleware.js");
const index_js_1 = require("../../common/utils/index.js");
const enum_1 = require("../../common/enum");
const validators = __importStar(require("./user.validation.js"));
const validation_middleware_js_1 = require("../../middleware/validation.middleware.js");
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
router.patch('/profile-image', (0, authentication_middleware_js_1.authentication)(), (0, multer_middleware_js_1.uploadMiddleware)({
    multerMiddleware: (0, index_js_1.localFileUpload)({ storageApproach: enum_1.StorageApproachEnum.DISK }).single("attachment"),
    validation: index_js_1.fileValidation.files,
    customPath: "User"
}), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    return { data: req.file };
}));
router.post('/send-friend-request', (0, authentication_middleware_js_1.authentication)(), (0, validation_middleware_js_1.validation)(validators.sendFriendRequest), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const request = await user_service_js_1.default.sendFriendRequest(req.body, req.user);
    return { data: request };
}));
router.patch('/accept-friend-request/:friendRequestId', (0, authentication_middleware_js_1.authentication)(), (0, validation_middleware_js_1.validation)(validators.acceptFriendRequest), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const request = await user_service_js_1.default.acceptFriendRequest(req.params, req.user);
    return { data: request };
}));
router.patch('/cancel-friend-request/:friendRequestId', (0, authentication_middleware_js_1.authentication)(), (0, validation_middleware_js_1.validation)(validators.acceptFriendRequest), (0, response_middleware_js_1.responseFormatter)(async (req, res, next) => {
    const request = await user_service_js_1.default.cancelFriendRequest(req.params, req.user);
    return { data: request };
}));
exports.default = router;
