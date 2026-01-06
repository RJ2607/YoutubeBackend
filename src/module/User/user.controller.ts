import { Request, Response } from "express";
import { Repository } from "typeorm";
import { ErrorCode } from "../../helper/response";
import { checkPassword, hashPassword, sendResponse } from "../../helper/utils";
import { User } from "./user.entity";
import { UserService } from "./user.service";

export class UserController {
  userRepo: Repository<User>;
  service: UserService;

  constructor(userRepo: Repository<User>, service: UserService) {
    this.userRepo = userRepo;
    this.service = service;
  }

  async getUsers(req: Request, res: Response) {
    const users = await this.userRepo.find();
    res.json(users);
  }

  async signUp(req: Request, res: Response) {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return sendResponse(res, {
        statusCode: ErrorCode.BadRequest,
        error: true,
        message: "Bad response",
        result: "Missing fields",
      });
    }

    if (password.length < 8) {
      return sendResponse(res, {
        statusCode: ErrorCode.BadRequest,
        error: true,
        message: "Bad response",
        result: "Password requirements are not met.",
      });
    }

    const userExists = await this.userRepo.existsBy({
      email: email,
    });

    if (userExists) {
      return sendResponse(res, {
        statusCode: ErrorCode.BadRequest,
        error: true,
        message: "Bad response",
        result: "User already exists",
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = this.userRepo.create({
      fullName: fullName,
      email: email,
      password: hashedPassword,
    });

    await this.userRepo.save(user);

    const tokenResponse = await this.service.generateToken(user);

    return sendResponse(res, {
      statusCode: ErrorCode.Created,
      error: false,
      message: "Successfully created your account",
      result: tokenResponse.result,
    });
  }

  async signIn(req: Request, res: Response) {
    const { credentials, password } = req.body;

    if (!credentials || !password) {
      return sendResponse(res, {
        statusCode: ErrorCode.BadRequest,
        error: true,
        message: "Bad response",
        result: "Missing fields",
      });
    }

    const user = await this.userRepo.findOne({
      where: [{ email: credentials }, { userName: credentials }],
    });

    if (!user) {
      return sendResponse(res, {
        statusCode: ErrorCode.BadRequest,
        error: true,
        message: "Bad response",
        result: "Invalid credentials",
      });
    }

    const check = await checkPassword(password, user.password);

    if (!check) {
      return sendResponse(res, {
        statusCode: ErrorCode.BadRequest,
        error: true,
        message: "Bad response",
        result: "Invalid credentials",
      });
    }

    const tokenResponse = await this.service.generateToken(user);

    return sendResponse(res, {
      statusCode: ErrorCode.Success,
      error: false,
      message: "Successfully signed in",
      result: tokenResponse.result,
    });
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendResponse(res, {
        statusCode: ErrorCode.BadRequest,
        error: true,
        message: "Bad response",
        result: "Missing refresh token",
      });
    }

    const response = await this.service.refreshToken(refreshToken);

    return sendResponse(res, {
      statusCode: response.status.code,
      error: response.status.error,
      message: response.message,
      result: response.result,
    });
  }

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendResponse(res, {
        statusCode: ErrorCode.BadRequest,
        error: true,
        message: "Bad response",
        result: "Missing refresh token",
      });
    }

    const response = await this.service.invalidateToken(refreshToken);

    return sendResponse(res, {
      statusCode: response.status.code,
      error: response.status.error,
      message: response.message,
      result: response.result,
    });
  }

  async getUserById(req: Request, res: Response) {
    const user = await this.userRepo.findOneBy({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  }
}
