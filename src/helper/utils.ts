import * as bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { IUser } from "../module/User/user.entity";
import { ApiResponse, ErrorCode, Status } from "./response";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function checkPassword(inputPassword: string, checkPassword: string) {
  return await bcrypt.compare(inputPassword, checkPassword);
}

export function sendResponse<T>(
  res: any,
  {
    result,
    message = "Success",
    count,
    error,
    statusCode,
  }: {
    result?: T;
    message?: string;
    count?: number;
    error?: boolean;
    statusCode?: ErrorCode;
  }
) {
  const response = new ApiResponse<T>({
    status: new Status({ code: statusCode, error }),
    message,
    result,
    count,
  });

  return res.status(statusCode).json(response);
}

export function decodeJwt(token: string, secret: string) {
	try {
		const payload = jwt.verify(token, secret)
		return {
			data: payload as { sub: string; tid: string } & IUser
		} as const
	} catch (error: any) {
		return {
			errorMessage: error?.message || 'Error in decoding token'
		} as const
	}
}
