"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_js_1 = require("../../common/enum/user.enum.js");
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20,
    },
    lastName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: function () {
            return this.provider == user_enum_js_1.ProviderEnum.SYSTEM;
        },
    },
    phone: String,
    DOB: Date,
    confirmEmail: Date,
    image: String,
    coverImage: [String],
    gender: {
        type: Number,
        enum: user_enum_js_1.GenderEnum,
        default: user_enum_js_1.GenderEnum.MALE,
    },
    role: {
        type: Number,
        enum: user_enum_js_1.RoleEnum,
        default: user_enum_js_1.RoleEnum.USER,
    },
    provider: {
        type: Number,
        enum: user_enum_js_1.ProviderEnum,
        default: user_enum_js_1.ProviderEnum.SYSTEM,
    },
    changeCredentialsTime: Date
}, {
    timestamps: true,
    strict: false,
    validateBeforeSave: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    optimisticConcurrency: true,
});
userSchema
    .virtual("username")
    .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
