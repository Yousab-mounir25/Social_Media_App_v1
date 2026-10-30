import {z} from 'zod'
import { confirmEmail, resendConfirmEmail, signup } from '../authentication.validation.js'

// export interface ISignupDto{
//     usernmae:string,
//     email:string,
//     phone:string,
//     password:string
// }


export type SignupDto = z.infer <ReturnType<typeof signup>> //validation + DTO in one shoot
export type ConfirmEmailDto = z.infer <ReturnType<typeof confirmEmail>>['body'] //validation + DTO in one shoot
export type ResendConfirmEmailDto = z.infer <ReturnType<typeof resendConfirmEmail>>['body'] //validation + DTO in one shoot