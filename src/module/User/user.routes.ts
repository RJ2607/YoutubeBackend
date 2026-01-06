import { Router } from "express";
import { Repository } from "typeorm";
import { AuthMiddleware } from "../../helper/authMiddleware";
import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { UserService } from "./user.service";

export class UserRoutes {
  private path = "/user";
  userRepo: Repository<User>;
  service: UserService;
  controller: UserController;

  constructor(userRepo: Repository<User>, public userRouter: Router, readonly authMiddleWare: AuthMiddleware) {
    this.userRepo = userRepo;
    this.service = new UserService(userRepo);
    this.controller = new UserController(userRepo, this.service);
  }

  registerRoutes() {
    this.userRouter.get(
      this.path,
      this.authMiddleWare.generateAuthMiddleWare(),
      this.controller.getUsers.bind(this.controller)
    );
    this.userRouter.get(
      this.path + "/:id",
      this.authMiddleWare.generateAuthMiddleWare(),
      this.controller.getUserById.bind(this.controller)
    );
    this.userRouter.post(this.path + "/sign-up", this.controller.signUp.bind(this.controller));
    this.userRouter.post(this.path + "/sign-in", this.controller.signIn.bind(this.controller));
    this.userRouter.post(
      this.path + "/refresh-token",
      this.authMiddleWare.generateAuthMiddleWare(),
      this.controller.refreshToken.bind(this.controller)
    );
    this.userRouter.post(
      this.path + "/logout",
      this.authMiddleWare.generateAuthMiddleWare(),
      this.controller.logout.bind(this.controller)
    );
  }
}
