"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = exports.matchFields = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const security_enum_js_1 = require("../enum/security.enum.js");
const user_enum_js_1 = require("../enum/user.enum.js");
const matchFields = ({ original, copy, data, ctx, lang }) => {
    if (data[original] != data[copy]) {
        ctx.addIssue({
            code: "custom",
            path: [copy],
            message: lang == security_enum_js_1.LanguageEnum.EN
                ? `Failed to match between ${original} and ${copy}`
                : `فشل في مطابقة بين ${original} و ${copy}`,
        });
    }
};
exports.matchFields = matchFields;
exports.generalValidationFields = {
    email: (lang) => zod_1.z.email({
        message: lang == security_enum_js_1.LanguageEnum.EN
            ? "invalid email format, please enter email like: any@any.com"
            : "عفوا تنسيق البريد الإلكتروني غير صحيح, يرجى ادخال البريد الإلكتروني مثل: any@any.com",
    }),
    password: (lang) => zod_1.z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!#$%^&*_-\|])(?=.*\s{0,}).{8,16}$/, {
        message: lang == security_enum_js_1.LanguageEnum.EN
            ? "Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character"
            : "كلمة المرور يجب أن تحتوي على حرف صغير واحد، حرف كبير واحد، رقم واحد، حرف خاص واحد، "
    })
        .min(8, {
        message: lang == security_enum_js_1.LanguageEnum.EN
            ? "min length is 8 char"
            : " عفوا لا يمكن ادخال كلمة المرور اقل من 8 حروف",
    })
        .max(16, {
        message: lang == security_enum_js_1.LanguageEnum.EN
            ? "max length is 16 char"
            : " عفوا لا يمكن ادخال كلمة المرور اكثر من 16 حرف",
    }),
    username: (lang) => zod_1.z
        .string()
        .min(2, {
        message: lang == security_enum_js_1.LanguageEnum.EN
            ? "min length is 2 char"
            : " عفوا لا يمكن ادخال اسم المستخدم اقل من حرفين",
    })
        .max(50, {
        message: lang == security_enum_js_1.LanguageEnum.EN
            ? "max length is 50 char"
            : " عفوا لا يمكن ادخال اسم المستخدم اكثر من 50 حرف",
    }),
    phone: (lang) => zod_1.z.e164({
        message: lang == security_enum_js_1.LanguageEnum.EN
            ? "invalid phone number format, please enter phone like: +20123456789"
            : "عفوا رقم الهاتف غير صحيح, يرجى ادخال رقم الهاتف مثل: +20123456789",
    }),
    confirmPassword: (lang) => zod_1.z
        .string()
        .min(8, {
        message: lang == security_enum_js_1.LanguageEnum.EN
            ? "min length is 8 char"
            : " عفوا لا يمكن ادخال كلمة المرور اقل من 8 حروف",
    })
        .max(16, {
        message: lang == security_enum_js_1.LanguageEnum.EN
            ? "max length is 16 char"
            : " عفوا لا يمكن ادخال كلمة المرور اكثر من 16 حرف",
    }),
    gender: (lang) => zod_1.z.enum(user_enum_js_1.GenderEnum).optional(),
    otp: (lang) => zod_1.z.string().regex(/^\d{6}$/, {
        message: lang == security_enum_js_1.LanguageEnum.EN
            ? "invalid otp format, please enter otp like: 123456"
            : "عفوا رمز التحقق غير صحيح, يرجى ادخال رمز التحقق مثل: 123456",
    }),
    id: (lang) => zod_1.z.string().refine((data) => { return mongoose_1.default.Types.ObjectId.isValid(data); }, { message: "Invalid ID" }),
    file: (lang) => zod_1.z.strictObject({
        fieldname: zod_1.z.string(),
        originalname: zod_1.z.string(),
        encoding: zod_1.z.string(),
        mimetype: zod_1.z.string(),
        buffer: zod_1.z.instanceof(Buffer),
        size: zod_1.z.number(),
        path: zod_1.z.string()
    }),
    matchFields: exports.matchFields,
};
