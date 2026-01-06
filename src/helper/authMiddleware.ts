import { NextFunction, Request, Response } from "express";
import { Repository } from "typeorm";
import { User } from "../module/User/user.entity";
import { ErrorCode } from "./response";
import { decodeJwt, sendResponse } from "./utils";

export class AuthMiddleware {
  userRepo: Repository<User>;

  constructor(userRepo: Repository<User>) {
    this.userRepo = userRepo;
  }

  generateAuthMiddleWare(optionalToken = false ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const cookie = req.get("Authorization")?.split(" ")[1];

        if (!cookie) {
          if (optionalToken) {
            next();
            return;
          }
          return sendResponse(res, {
            error: true,
            statusCode: ErrorCode.NotAuthorized,
            message: "No authorization token provided",
          });
        }

        const decoded = decodeJwt(cookie, process.env.jwtSecretKey);

        if (decoded.errorMessage) {
          if (optionalToken) {
            next();
            return;
          }
          return sendResponse(res, { statusCode: ErrorCode.NotAuthorized, error: true, message: decoded.errorMessage });
        }

        return next();
      } catch (error) {
        return sendResponse(res, {
          statusCode: ErrorCode.InternalServerError,
          error: true,
          message: "Internal server error",
        });
      }
    };
  }
}
