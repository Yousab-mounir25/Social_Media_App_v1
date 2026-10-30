"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const email_enum_js_1 = require("../../enum/email.enum.js");
const send_email_js_1 = require("./send.email.js");
const index_js_1 = require("./index.js");
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on("sendEmail", async ({ recipient, subject = email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL, data }) => {
    try {
        await (0, send_email_js_1.sendEmail)({
            ...recipient,
            subject,
            html: (0, index_js_1.emailTemplate)({ subject, data }),
        });
    }
    catch (error) {
        console.log("Failed to send email");
    }
});
