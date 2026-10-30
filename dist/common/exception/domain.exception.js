"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyRequestException = exports.ConflictException = exports.UnAuthorizedException = exports.ForbiddenException = exports.NotFoundException = exports.BadRequestException = void 0;
const application_exception_js_1 = require("./application.exception.js");
class BadRequestException extends application_exception_js_1.ApplicationException {
    constructor(message = "BadRequest", cause) {
        super(message, 400, cause);
    }
}
exports.BadRequestException = BadRequestException;
class NotFoundException extends application_exception_js_1.ApplicationException {
    constructor(message = "NotFound", cause) {
        super(message, 404, cause);
    }
}
exports.NotFoundException = NotFoundException;
class ForbiddenException extends application_exception_js_1.ApplicationException {
    constructor(message = "Forbidden", cause) {
        super(message, 403, cause);
    }
}
exports.ForbiddenException = ForbiddenException;
class UnAuthorizedException extends application_exception_js_1.ApplicationException {
    constructor(message = "UnAuthorized", cause) {
        super(message, 401, cause);
    }
}
exports.UnAuthorizedException = UnAuthorizedException;
class ConflictException extends application_exception_js_1.ApplicationException {
    constructor(message = "Conflict", cause) {
        super(message, 409, cause);
    }
}
exports.ConflictException = ConflictException;
class TooManyRequestException extends application_exception_js_1.ApplicationException {
    constructor(message = "TooManyRequest", cause) {
        super(message, 429, cause);
    }
}
exports.TooManyRequestException = TooManyRequestException;
