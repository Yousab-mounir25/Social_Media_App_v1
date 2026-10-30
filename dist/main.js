"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const modules_1 = require("./modules");
const index_1 = require("./middleware/index");
const config_js_1 = require("./config.js");
const connection_db_js_1 = require("./DB/connection.db.js");
const send_email_js_1 = require("./common/utils/Email/send.email.js");
const email_enum_js_1 = require("./common/enum/email.enum.js");
const app = (0, express_1.default)();
(0, connection_db_js_1.bootstrapDB)(app, config_js_1.PORT);
app.use(express_1.default.json());
app.use('/auth', modules_1.authenticationController);
(0, send_email_js_1.sendEmail)({
    subject: email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL,
    to: ["yousab.mounir@gmail.com"],
    html: "Hello yousab"
});
app.all('/', (req, res, next) => {
    return res.status(200).json({ message: "Done" });
});
app.all('/ayHaga', async (req, res, next) => {
    return res.status(200).json({ message: "Done" });
});
app.use(index_1.globalErrorHandling);
