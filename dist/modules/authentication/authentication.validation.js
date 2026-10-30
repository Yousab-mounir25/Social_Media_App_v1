"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithGmail = exports.resetForgotPassword = exports.resendConfirmEmail = exports.confirmEmail = exports.signup = exports.login = exports.loginSchema = void 0;
const zod_1 = require("zod");
const user_enum_js_1 = require("../../common/enum/user.enum.js");
const validation_js_1 = require("../../common/utils/validation.js");
const loginSchema = (lang) => {
    return zod_1.z.strictObject({
        email: validation_js_1.generalValidationFields.email(lang),
        password: validation_js_1.generalValidationFields.password(lang),
    });
};
exports.loginSchema = loginSchema;
const login = (lang) => {
    return zod_1.z.object({
        body: (0, exports.loginSchema)(lang),
        query: zod_1.z.strictObject({
            lang: zod_1.z.enum(["ar", "en"]).default("ar"),
            darkMood: zod_1.z.stringbool({
                truthy: ["true", "True", "1"],
                falsy: ["false", "False", "0"],
            }).optional(),
        }),
    });
};
exports.login = login;
const signup = (lang) => {
    return zod_1.z.object({
        body: (0, exports.loginSchema)(lang)
            .safeExtend({
            username: validation_js_1.generalValidationFields.username(lang),
            phone: validation_js_1.generalValidationFields.phone(lang),
            confirmPassword: validation_js_1.generalValidationFields.confirmPassword(lang),
            confirmEmail: validation_js_1.generalValidationFields.email(lang),
            role: zod_1.z.enum(user_enum_js_1.RoleEnum),
            gender: validation_js_1.generalValidationFields.gender(lang),
        })
            .superRefine((data, ctx) => {
            validation_js_1.generalValidationFields.matchFields({
                original: "password",
                copy: "confirmPassword",
                data,
                ctx,
                lang
            });
            validation_js_1.generalValidationFields.matchFields({
                original: "email",
                copy: "confirmEmail",
                data,
                ctx,
                lang
            });
            if (data.username.includes("admin")) {
                ctx.addIssue({
                    code: "custom",
                    path: ["username"],
                    message: "UserName cannot be contain admin",
                });
            }
        }),
    });
};
exports.signup = signup;
const confirmEmail = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_js_1.generalValidationFields.email(lang),
            otp: validation_js_1.generalValidationFields.otp(lang)
        })
    });
};
exports.confirmEmail = confirmEmail;
const resendConfirmEmail = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_js_1.generalValidationFields.email(lang)
        })
    });
};
exports.resendConfirmEmail = resendConfirmEmail;
const resetForgotPassword = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_js_1.generalValidationFields.email(lang),
            otp: validation_js_1.generalValidationFields.otp(lang),
            password: validation_js_1.generalValidationFields.password(lang),
            confirmPassword: validation_js_1.generalValidationFields.confirmPassword(lang),
        }).superRefine((data, ctx) => {
            validation_js_1.generalValidationFields.matchFields({
                original: "password",
                copy: "confirmPassword",
                data,
                ctx,
                lang
            });
        })
    });
};
exports.resetForgotPassword = resetForgotPassword;
const loginWithGmail = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            idToken: zod_1.z.string().min(1),
        }),
    });
};
exports.loginWithGmail = loginWithGmail;
