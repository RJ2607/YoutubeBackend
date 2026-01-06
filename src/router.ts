import express, { Router } from "express";
import { AppDataSource } from "./data-source";
import { User } from "./module/User/user.entity";
import { UserRoutes } from "./module/User/user.routes";

export function initializeRoutes(): Router {
  const apiRouter = express.Router();

  const userRepo = AppDataSource.getRepository(User);
  const userRoutes = new UserRoutes(userRepo, apiRouter);
  userRoutes.registerRoutes();

  return apiRouter;
}


