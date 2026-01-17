import { NextFunction, Request, Response } from 'express'
import { Repository } from 'typeorm'
import { User } from '../module/User/user.entity'
import { ErrorCode, Result } from './response'
import { decodeJwt, sendResponse } from './utils'

export class AuthMiddleware {
	userRepo: Repository<User>

	constructor(userRepo: Repository<User>) {
		this.userRepo = userRepo
	}

	generateAuthMiddleWare(optionalToken = false) {
		return async (req: Request, res: Response, next: NextFunction) => {
			try {
				const cookie = req.get('Authorization')?.split(' ')[1]

				if (!cookie) {
					if (optionalToken) {
						next()
						return
					}
					return sendResponse(
						res,
						new Result({
							error: true,
							code: ErrorCode.NotAuthorized,
							message: 'No authorization token provided'
						})
					)
				}

				const decoded = decodeJwt(cookie, process.env.JWT_SECRET_KEY)
				if (decoded.errorMessage) {
					if (optionalToken) {
						next()
						return
					}
					return sendResponse(
						res,
						new Result({
							code: ErrorCode.NotAuthorized,
							error: true,
							message: decoded.errorMessage
						})
					)
				}

				return next()
			} catch (error) {
				return sendResponse(
					res,
					new Result({
						code: ErrorCode.InternalServerError,
						error: true,
						message: 'Internal server error'
					})
				)
			}
		}
	}
}
