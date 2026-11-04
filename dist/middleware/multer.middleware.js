"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const local_multer_js_1 = require("../common/utils/multer/local.multer.js");
const uploadMiddleware = ({ isRequired = true, multerMiddleware, customPath = "general", validation = [], }) => {
    return async (req, res, next) => {
        multerMiddleware(req, res, async (error) => {
            if (error) {
                next(new Error(error.message, { cause: { status: 400 } }));
                return;
            }
            try {
                if (isRequired && (!req.file &&
                    !(Array.isArray(req.files) && req.files?.length) &&
                    !(typeof req.files == "object" && Object.keys(req.files)?.length))) {
                    next(new Error("file is required", { cause: { status: 400 } }));
                    return;
                }
                await (0, local_multer_js_1.processMulterUpload)({ req, customPath, validation, isRequired });
                next();
            }
            catch (error) {
                next(new Error(error.message, { cause: { status: 400 } }));
            }
        });
    };
};
exports.uploadMiddleware = uploadMiddleware;
