import z from "zod"
import { LanguageEnum } from "../../common/enum/security.enum.js"
import { generalValidationFields } from "../../common/utils/validation.js"






export const sendFriendRequest = (lang:LanguageEnum)=>{
  return z.object({
    body:z.strictObject({
      receiverId:generalValidationFields.id(lang),
      // senderId:generalValidationFields.id(lang),
      note:z.string().optional()
    })
  })
}
export const acceptFriendRequest = (lang:LanguageEnum)=>{
  return z.object({
    params:z.strictObject({
      friendRequestId:generalValidationFields.id(lang),
    })
  })
}