import jwt from 'jsonwebtoken'
import { ILike, Repository } from 'typeorm'
import { ErrorCode, Result } from '../../helper/response'
import { checkPassword, hashPassword } from '../../helper/utils'
import RedisDatabaseObject from '../../redis/redis-connection'
import { IUser, User } from './user.entity'

export class UserService {
	userRepo: Repository<User>

	constructor(userRepo: Repository<User>) {
		this.userRepo = userRepo
	}

	async updateUser(userDate: IUser) {
		if (!userDate.id) {
			return new Result({
				code: ErrorCode.BadRequest,
				error: true,
				message: 'Missing required params'
			})
		}

		await this.userRepo.update(userDate.id, userDate)
		return new Result({
			code: ErrorCode.Success,
			error: false,
			message: 'Update Successfully',
			result: 1
		})
	}

	async signUp(email: string, password: string) {
		if (!email || !password) {
			return new Result({
				code: ErrorCode.BadRequest,
				error: true,
				message: 'Missing required params'
			})
		}

		if (password.length < 8) {
			return new Result({
				code: ErrorCode.BadRequest,
				error: true,
				message: 'Password requirements are not met.'
			})
		}

		const userExists = await this.userRepo.existsBy({
			email: email
		})

		if (userExists) {
			return new Result({
				code: ErrorCode.BadRequest,
				error: true,
				message: 'User already exists'
			})
		}

		const hashedPassword = await hashPassword(password)
		const user = this.userRepo.create({
			email: email,
			password: hashedPassword
		})

		await this.userRepo.save(user)

		const tokenResponse = await this.generateToken(user)

		return new Result({
			code: ErrorCode.Success,
			error: false,
			message: 'Successfully created your account',
			result: tokenResponse.result
		})
	}

	async signIn(email: string, password: string) {
		if (!email || !password) {
			return new Result({
				code: ErrorCode.BadRequest,
				error: true,
				message: 'Missing fields'
			})
		}

		const user = await this.userRepo.findOne({
			where: [{ email: email }]
		})

		if (!user) {
			return new Result({
				code: ErrorCode.BadRequest,
				error: true,
				message: 'Invalid credentials'
			})
		}

		const check = await checkPassword(password, user.password)

		if (!check) {
			return new Result({
				code: ErrorCode.BadRequest,
				error: true,
				message: 'Invalid credentials'
			})
		}

		const tokenResponse = await this.generateToken(user)

		return new Result({
			code: ErrorCode.Success,
			error: false,
			message: 'Successfully signed in',
			result: tokenResponse.result
		})
	}

	async onboardUser(
		userName: string,
		fullName: string | undefined,
		avatar: string | undefined,
		coverImage: string | undefined,
		userId: string
	) {
		const userExist = await this.userRepo.existsBy({ id: userId })
		if (!userExist) {
			return new Result({
				code: ErrorCode.NotFound,
				error: true,
				message: `User doesn't exist`
			})
		}
		const userNameVerify = await this.verifyUser(userName)

		if (userNameVerify.status.error) {
			return userNameVerify
		}
		// upload images to cloud and save url in db

		await this.userRepo.update(userId, {
			userName,
			fullName,
			avatar,
			coverImage
		})

		return new Result({
			code: ErrorCode.Success,
			error: false,
			message: 'User Successfully onboarded',
			result: 1
		})
	}

	async verifyUser(userName: string) {
		if (!userName) {
			return new Result({
				code: ErrorCode.BadRequest,
				error: true,
				message: 'User name already exist'
			})
		}
		const userNameExist = await this.userRepo.existsBy({ userName: ILike(`%${userName}%`) })

		if (userNameExist) {
			return new Result({
				code: ErrorCode.BadRequest,
				error: true,
				message: 'User name already exist'
			})
		}

		return new Result({
			code: ErrorCode.Success,
			error: false,
			message: 'User name Approved',
			result: userName
		})
	}

	async generateToken(user: User) {
		const tid = crypto.randomUUID()
		const refreshTokenId = crypto.randomUUID()
		const tokenExpiry = 2 * 3600
		const refreshExpiry = 30 * 24 * 60 * 60

		const token = jwt.sign(
			{
				sub: user.id,
				userId: user.id,
				email: user.email,
				fullName: user.fullName,
				tid
			},
			process.env.JWT_SECRET_KEY,
			{
				algorithm: 'HS256',
				expiresIn: tokenExpiry
			}
		)

		const refreshToken = jwt.sign(
			{
				tid: refreshTokenId,
				userId: user.id
			},
			process.env.REFRESH_SECRET_KEY,
			{
				algorithm: 'HS256',
				expiresIn: refreshExpiry
			}
		)

		const { connection } = await RedisDatabaseObject
		await connection.set(
			`refresh-token:${refreshTokenId}`,
			JSON.stringify({ userId: user.id }),
			'EX',
			refreshExpiry
		)

		return new Result({
			code: ErrorCode.Success,
			error: false,
			message: 'Tokens generated successfully',
			result: {
				accessToken: token,
				refreshToken: refreshToken,
				expiresIn: tokenExpiry,
				type: 'Bearer'
			}
		})
	}

	async refreshToken(refreshToken: string): Promise<
		Result<{
			accessToken: string
			refreshToken: string
			expiresIn: number
			type: string
		}>
	> {
		try {
			const { connection } = await RedisDatabaseObject

			const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, {
				algorithms: ['HS256']
			}) as { tid: string; userId: string }

			const token = await connection.get(`refresh-token:${decoded.tid}`)

			if (!token) {
				return new Result({
					status: { code: ErrorCode.NotAuthorized, error: true },
					message: 'Invalid refresh token'
				})
			}

			const values = JSON.parse(token)
			const user = await this.userRepo.findOneBy({ id: values.userId })

			if (!user) {
				return new Result({
					status: { code: ErrorCode.NotAuthorized, error: true },
					message: 'Invalid user'
				})
			}
			await connection.del(`refresh-token:${decoded.tid}`)

			return this.generateToken(user)
		} catch (error) {
			return new Result({
				status: { code: ErrorCode.InternalServerError, error: true },
				message: 'Error in refreshing token'
			})
		}
	}

	async invalidateToken(refreshToken: string): Promise<Result<boolean>> {
		try {
			const { connection } = await RedisDatabaseObject

			const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, {
				algorithms: ['HS256']
			}) as { tid: string; userId: string }

			const token = await connection.get(`refresh-token:${decoded.tid}`)

			if (!token) {
				return new Result({
					code: ErrorCode.NotAuthorized,
					error: true,
					message: 'Invalid refresh token'
				})
			}

			await connection.del(`refresh-token:${decoded.tid}`)

			return new Result({
				status: { code: ErrorCode.Success, error: false },
				message: 'Token invalidated',
				result: true
			})
		} catch (error) {
			return new Result({
				status: { code: ErrorCode.InternalServerError, error: true },
				message: 'Error in invalidating token'
			})
		}
	}

	decodeToken(token: string) {
		try {
			const decoded = jwt.decode(token) as {
				userId: string
				isAdmin: boolean
				tid: string
			}

			return new Result({
				status: { code: ErrorCode.Success, error: false },
				message: 'Token Decoded',
				result: {
					userId: decoded.userId,
					isAdmin: decoded.isAdmin
				}
			})
		} catch (error) {
			return new Result({
				status: { code: ErrorCode.BadRequest, error: false },
				message: 'Error in verifying token'
			})
		}
	}
}
