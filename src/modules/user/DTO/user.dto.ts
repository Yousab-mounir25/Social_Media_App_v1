import z from "zod";
import { acceptFriendRequest, sendFriendRequest } from './../user.validation';


export type SendFriendRequestDTO = z.infer<ReturnType<typeof sendFriendRequest>>['body']
export type AcceptFriendRequestDTO = z.infer<ReturnType<typeof acceptFriendRequest>>['params']