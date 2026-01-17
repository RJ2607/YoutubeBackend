import express, { Router } from "express";
import { AppDataSource } from "./data-source";
import { AuthMiddleware } from "./helper/authMiddleware";
import { User } from "./module/User/user.entity";
import { UserRoutes } from "./module/User/user.routes";

export function initializeRoutes(): Router {
  const apiRouter = express.Router();

  const userRepo = AppDataSource.getRepository(User);
  const authMiddleWare = new AuthMiddleware(userRepo);
  const userRoutes = new UserRoutes(userRepo, apiRouter, authMiddleWare);
  userRoutes.registerRoutes();

  return apiRouter;
}
