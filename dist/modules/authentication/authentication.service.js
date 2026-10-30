"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const domain_exception_js_1 = require("../../common/exception/domain.exception.js");
const user_repository_1 = require("./../../common/repository/user.repository");
const cache_services_1 = require("./../../common/services/cache.services");
const hash_security_js_1 = require("../../common/security/hash.security.js");
const send_email_js_1 = require("../../common/utils/Email/send.email.js");
const email_enum_js_1 = require("../../common/enum/email.enum.js");
const email_event_js_1 = require("../../common/utils/Email/email.event.js");
const index_js_1 = require("./../../common/utils/index.js");
const encryption_security_js_1 = require("../../common/security/encryption.security.js");
const user_enum_js_1 = require("../../common/enum/user.enum.js");
class AuthenticationService {
    userRepository;
    cacheService;
    constructor() {
        this.cacheService = cache_services_1.cacheService;
        this.userRepository = new user_repository_1.UserRepository();
    }
    async sendEmailOtp({ email, subject, expiresIn = 120, maxTrials = 3, blockIn = 300 }) {
        const existOtp_ttl = await this.cacheService.ttl({ key: (0, send_email_js_1.userEmailKey)({ email, subject }) });
        if (existOtp_ttl > 0) {
            throw new domain_exception_js_1.ConflictException(`sorry we cannot create otp while the old one still valid, please try again after ${existOtp_ttl}`);
        }
        const oldTrials = await this.cacheService.get({ key: (0, send_email_js_1.userEmailTrialsKey)({ email, subject }) }) ?? 0;
        if (oldTrials >= maxTrials) {
            throw new domain_exception_js_1.TooManyRequestException("Max otp trials has been reached");
        }
        const code = (0, index_js_1.createOtp)();
        await this.cacheService.set({
            key: (0, send_email_js_1.userEmailKey)({ email, subject }),
            value: await (0, hash_security_js_1.hash)(code.toString()),
            ttl: expiresIn,
        });
        const currentTrials = await this.cacheService.incrBy({ key: (0, send_email_js_1.userEmailTrialsKey)({ email, subject }) });
        if (currentTrials == 3) {
            await this.cacheService.expire({ key: (0, send_email_js_1.userEmailTrialsKey)({ email, subject }), ttl: blockIn });
        }
        email_event_js_1.emailEvent.emit("sendEmail", {
            recipient: { to: email },
            subject: email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL,
            data: { code },
        });
    }
    ;
    async signup(inputs) {
        const { username, email, password, phone } = inputs;
        const existingUser = await this.userRepository.findOne({
            filter: { email }
        });
        if (existingUser) {
            throw new domain_exception_js_1.ConflictException("Email exist");
        }
        const user = await this.userRepository.createOne({
            data: {
                username,
                email,
                password: await (0, hash_security_js_1.hash)(password),
                phone: await (0, encryption_security_js_1.encryption)(phone),
            },
        });
        await this.sendEmailOtp({ email, subject: email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return user;
    }
    ;
    async confirmEmail(inputs) {
        const { otp, email } = inputs;
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: false },
            },
        });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("Invalid email or account already confirmed");
        }
        const hashOtp = await this.cacheService.get({
            key: (0, send_email_js_1.userEmailKey)({ email, subject: email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL }),
        });
        if (!hashOtp || !(await (0, hash_security_js_1.compare)(otp.toString(), hashOtp))) {
            throw new domain_exception_js_1.BadRequestException("Invalid OTP");
        }
        account.confirmEmail = new Date();
        await account?.save();
        await this.cacheService.del({
            key: await this.cacheService.keys({ prefix: (0, send_email_js_1.userEmailKey)({ email, subject: email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL }) }),
        });
        return;
    }
    ;
    async resendConfirmEmail(inputs) {
        const { email } = inputs;
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: false },
            },
            options: { select: "email" },
        });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("Invalid email or account already confirmed");
        }
        await this.sendEmailOtp({ email, subject: email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return;
    }
    ;
}
exports.AuthenticationService = AuthenticationService;
exports.default = new AuthenticationService();
