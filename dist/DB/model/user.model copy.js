"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_js_1 = require("../../common/enum/user.enum.js");
const hash_security_js_1 = require("../../common/security/hash.security.js");
const encryption_security_js_1 = require("../../common/security/encryption.security.js");
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
    friends: [{ type: mongoose_1.default.Types.ObjectId, ref: "User" }],
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
    changeCredentialsTime: Date,
    status: {
        type: Number,
        enum: user_enum_js_1.AccountStatusEnum,
        default: user_enum_js_1.AccountStatusEnum.ACTIVE
    },
    changeStatusAt: Date,
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
userSchema.pre('validate', function () {
    if (this.provider == user_enum_js_1.ProviderEnum.GOOGLE && this.password) {
        throw new Error("Google account cannot hold password");
    }
});
userSchema.pre('save', async function () {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
        this.password = await (0, hash_security_js_1.hash)(this.password);
    }
    if (this.isModified("phone")) {
        this.phone = await (0, encryption_security_js_1.encryption)(this.phone);
    }
});
userSchema.post('save', async function (doc) {
    doc.phone = await (0, encryption_security_js_1.decryption)(this.phone);
});
userSchema.pre(['findOne', 'find', 'countDocuments'], function () {
    const query = this.getFilter();
    if (query.paranoid == false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, status: { $ne: user_enum_js_1.AccountStatusEnum.ARCHIVE } });
    }
    console.log({ post: this.getFilter() });
});
userSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function () {
    const query = this.getFilter();
    const update = this.getUpdate();
    if (update.status == user_enum_js_1.AccountStatusEnum.ACTIVE) {
        this.setQuery({ ...query, status: { $eq: user_enum_js_1.AccountStatusEnum.ARCHIVE } });
    }
    else if (update.status == user_enum_js_1.AccountStatusEnum.ARCHIVE) {
        this.setQuery({ ...query, status: { $ne: user_enum_js_1.AccountStatusEnum.ARCHIVE } });
    }
    if (!update.status && query.paranoid != false) {
        this.setQuery({ ...query, status: { $ne: user_enum_js_1.AccountStatusEnum.ARCHIVE } });
    }
    this.setUpdate({
        ...update,
        ...(update.status ? { changeStatusAt: new Date() } : {})
    });
});
userSchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete'], function () {
    const query = this.getFilter();
    if (!query.force) {
        this.setQuery({ ...query, status: { $eq: user_enum_js_1.AccountStatusEnum.ARCHIVE } });
    }
});
userSchema.pre('insertMany', function (docs) {
    console.log(this);
});
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
