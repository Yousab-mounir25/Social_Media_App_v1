"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_js_1 = require("../../common/enum/user.enum.js");
const friendRequestSchema = new mongoose_1.default.Schema({
    note: {
        type: String,
        minlength: 5,
        maxlength: 500000
    },
    senderId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: { type: Number, default: user_enum_js_1.FriendRequestStatusEnum.PENDING, enum: user_enum_js_1.FriendRequestStatusEnum }
}, {
    timestamps: true,
    strict: false,
    validateBeforeSave: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    optimisticConcurrency: true,
});
exports.FriendRequestModel = mongoose_1.default.models.User || mongoose_1.default.model("FriendRequest ", friendRequestSchema);
