"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptFriendRequest = exports.sendFriendRequest = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_js_1 = require("../../common/utils/validation.js");
const sendFriendRequest = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.strictObject({
            receiverId: validation_js_1.generalValidationFields.id(lang),
            note: zod_1.default.string().optional()
        })
    });
};
exports.sendFriendRequest = sendFriendRequest;
const acceptFriendRequest = (lang) => {
    return zod_1.default.object({
        params: zod_1.default.strictObject({
            friendRequestId: validation_js_1.generalValidationFields.id(lang),
        })
    });
};
exports.acceptFriendRequest = acceptFriendRequest;
