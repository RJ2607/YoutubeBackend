import { Request, Response } from 'express'
import { Repository } from 'typeorm'
import { ErrorCode, Result } from '../../helper/response'
import { sendResponse } from '../../helper/utils'
import { IUser, User } from './user.entity'
import { UserService } from './user.service'

export class UserController {
	userRepo: Repository<User>
	service: UserService

	constructor(userRepo: Repository<User>, service: UserService) {
		this.userRepo = userRepo
		this.service = service
	}

	async getUsers(req: Request, res: Response) {
		const users = await this.userRepo.find()

		return sendResponse(
			res,
			new Result({
				code: ErrorCode.Success,
				error: false,
				message: 'Success in readmany', // add pagination here
				result: users
			})
		)
	}

	async updateUserHandler(req: Request, res: Response) {
		const userDate: IUser = req.body
		const result = await this.service.updateUser(userDate)
		sendResponse(res, result)
		return
	}

	async signUpHandler(req: Request, res: Response) {
		const { email, password } = req.body
		const result = await this.service.signUp(email, password)
		sendResponse(res, result)
		return
	}

	async signInHandler(req: Request, res: Response) {
		const { email, password } = req.body
		const result = await this.service.signIn(email, password)
		sendResponse(res, result)
		return
	}

	async refreshToken(req: Request, res: Response) {
		const { refreshToken } = req.body

		if (!refreshToken) {
			return sendResponse(
				res,
				new Result({
					code: ErrorCode.BadRequest,
					error: true,
					message: 'Bad response',
					result: 'Missing refresh token'
				})
			)
		}

		const response = await this.service.refreshToken(refreshToken)

		return sendResponse(
			res,
			new Result({
				code: response.status.code,
				error: response.status.error,
				message: response.message,
				result: response.result
			})
		)
	}

	async logout(req: Request, res: Response) {
		const { refreshToken } = req.body

		if (!refreshToken) {
			return sendResponse(
				res,
				new Result({
					code: ErrorCode.BadRequest,
					error: true,
					message: 'Bad response',
					result: 'Missing refresh token'
				})
			)
		}

		const response = await this.service.invalidateToken(refreshToken)

		return sendResponse(
			res,
			new Result({
				code: response.status.code,
				error: response.status.error,
				message: response.message,
				result: response.result
			})
		)
	}

	async getUserById(req: Request, res: Response) {
		const user = await this.userRepo.findOneBy({ id: req.params.id })
		if (!user) {
			return sendResponse(
				res,
				new Result({
					error: true,
					code: ErrorCode.NotFound,
					message: 'User Not Found'
				})
			)
		}
		return sendResponse(
			res,
			new Result({
				error: false,
				code: ErrorCode.Success,
				message: 'User Found',
				result: user
			})
		)
	}

	async onboardUserHandler(req: Request, res: Response) {
		const { userName, fullName, avatar, coverImage, userId } = req.body

		if (!userName || !fullName || !userId) {
			return sendResponse(
				res,
				new Result({
					error: true,
					code: ErrorCode.BadRequest,
					message: 'Missing required params'
				})
			)
		}

		const result = await this.service.onboardUser(userName, fullName, avatar, coverImage, userId)
		sendResponse(res, result)
		return
	}

	async verifyUserNameHandler(req: Request, res: Response) {
		const { userName } = req.query

		if (!userName) {
			return sendResponse(
				res,
				new Result({
					error: true,
					code: ErrorCode.BadRequest,
					message: 'Missing required params'
				})
			)
		}

		// verify userName
		const result = await this.service.verifyUser(userName?.toString())

		sendResponse(res, result)
		return
	}
}
