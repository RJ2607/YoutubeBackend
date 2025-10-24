import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { checkPassword, hashPassword, sendResponse } from "../../helper/utils";
import { User } from "./user.entity";

const userRepo = AppDataSource.getRepository(User);

export const getUsers = async (req: Request, res: Response) => {
  const users = await userRepo.find();
  res.json(users);
};

export const signUp = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return sendResponse(res, { statusCode: 400, error: true, message: "Bad response", result: "Missing fields" });
  }

  if (password.length !== 8) {
    return sendResponse(res, {
      statusCode: 400,
      error: true,
      message: "Bad response",
      result: "Password requirements are not met.",
    });
  }

  if (
    userRepo.existsBy({
      email: email,
    })
  ) {
    return sendResponse(res, { statusCode: 400, error: true, message: "Bad response", result: "User already exist" });
  }

  const hashedpassword = await hashPassword(password);
  userRepo.create({ fullName: fullName, email: email, password: hashedpassword });

  return sendResponse(res, { statusCode: 201, error: false, result: "Successfully created your account" });
};

export const signIn = async (req: Request, res: Response) => {
  const { credentials, password } = req.body;

  if (!credentials || !password) {
    return sendResponse(res, { statusCode: 400, error: true, message: "Bad response", result: "Missing fields" });
  }

  const user = await userRepo.findOne({
    where: [
      {
        email: credentials,
      },
      { userName: credentials },
    ],
  });

  if (!user) {
    return sendResponse(res, {
      statusCode: 400,
      error: true,
      message: "Bad response",
      result: "User doesn't exist please sign up",
    });
  }
  const check = checkPassword(password,user.password); 

  if (!check) {
    return sendResponse(res, {
      statusCode: 400,
      error: true,
      message: "Bad response",
      result: "Passwords don't match.",
    });
  }

  const hashedpassword = await hashPassword(password);

  return sendResponse(res, { statusCode: 201, error: false, result: "Successfully created your account" });
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await userRepo.findOneBy({ id: req.params.id });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};
