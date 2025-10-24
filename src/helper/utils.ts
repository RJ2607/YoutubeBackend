import * as bcrypt from "bcrypt";
import { ApiResponse, Status } from "./response";

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
    statusCode?: number;
  }
) {
  const response = new ApiResponse<T>({
    status: new Status({ code: statusCode.toString(), error }),
    message,
    result,
    count,
  });

  return res.status(statusCode).json(response);
}
