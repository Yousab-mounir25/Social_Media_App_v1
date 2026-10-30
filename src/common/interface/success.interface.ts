import { Response } from "express";

export interface IResponse<T=any , Z=any> {
  message?: boolean;
  data?: T;
  status?: number,
  extra?:Z
}
