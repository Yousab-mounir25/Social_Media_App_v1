"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseFormatter = void 0;
const responseFormatter = (handler) => {
    return async (req, res, next) => {
        const { status = 201, message = true, data = undefined, extra = undefined } = await handler(req, res, next) || {};
        return res.status(200).json({ message, status, data, extra });
    };
};
exports.responseFormatter = responseFormatter;
