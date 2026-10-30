import { randomInt } from "node:crypto";

// export const createOtp = ():number => {

//     return randomInt(
//         100000,
//         1000000
//     ).toString();

// };

export const createOtp = ():number=>{
    return Math.floor(
        Math.random()*(999999-100000 +1)+100000
    )
}