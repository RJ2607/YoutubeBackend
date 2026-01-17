import { Router } from 'express'
import { Repository } from 'typeorm'
import { AuthMiddleware } from '../../helper/authMiddleware'
import { UserController } from './user.controller'
import { User } from './user.entity'
import { UserService } from './user.service'

export class UserRoutes {
	private path = '/users'
	userRepo: Repository<User>
	service: UserService
	controller: UserController

	constructor(
		userRepo: Repository<User>,
		public userRouter: Router,
		public authMiddleWare: AuthMiddleware
	) {
		this.userRepo = userRepo
		this.service = new UserService(userRepo)
		this.controller = new UserController(userRepo, this.service)
	}

	registerRoutes() {
		this.userRouter.put(
			this.path,
			this.authMiddleWare.generateAuthMiddleWare(),
			this.controller.updateUserHandler.bind(this.controller)
		)
		this.userRouter.get(
			this.path,
			this.authMiddleWare.generateAuthMiddleWare(),
			this.controller.getUsers.bind(this.controller)
		)
		this.userRouter.get(
			this.path + '/:id',
			this.authMiddleWare.generateAuthMiddleWare(),
			this.controller.getUserById.bind(this.controller)
		)
		this.userRouter.post(
			this.path + '/sign-up',
			this.controller.signUpHandler.bind(this.controller)
		)
		this.userRouter.post(
			this.path + '/sign-in',
			this.controller.signInHandler.bind(this.controller)
		)
		this.userRouter.post(
			this.path + '/refresh-token',
			this.authMiddleWare.generateAuthMiddleWare(),
			this.controller.refreshToken.bind(this.controller)
		)
		this.userRouter.post(
			this.path + '/logout',
			this.authMiddleWare.generateAuthMiddleWare(),
			this.controller.logout.bind(this.controller)
		)
		this.userRouter.post(
			this.path + '/onboard-user',
			this.authMiddleWare.generateAuthMiddleWare(),
			this.controller.onboardUserHandler.bind(this.controller)
		)
		this.userRouter.get(
			this.path + '/verify-user-name',
			this.authMiddleWare.generateAuthMiddleWare(),
			this.controller.verifyUserNameHandler.bind(this.controller)
		)
	}
}
