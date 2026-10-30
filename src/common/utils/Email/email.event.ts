import { EventEmitter } from "node:events";
import { EmailSubjectEnum } from "../../enum/email.enum.js";
import { sendEmail } from "./send.email.js";
import { emailTemplate } from "./index.js";

export const emailEvent = new EventEmitter();

emailEvent.on("sendEmail", async ({ 
  recipient ,
   subject= EmailSubjectEnum.CONFIRM_EMAIL, 
   data 
}:{
  recipient:{to?:string[] ,cc?:string[] , bcc?:string[] },
  subject?:EmailSubjectEnum,
  data:any

}) => {
  try {
    await sendEmail({
      ...recipient,
      subject,
      html: emailTemplate({subject ,data }),
    });
  } catch (error) {
    console.log("Failed to send email");
  }
});
