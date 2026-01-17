import * as bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { IUser } from '../module/User/user.entity'
import { Result } from './response'

export async function hashPassword(password: string) {
	return await bcrypt.hash(password, 10)
}

export async function checkPassword(inputPassword: string, checkPassword: string) {
	return await bcrypt.compare(inputPassword, checkPassword)
}

export function sendResponse<T>(res: any, result: Result<T>) {
	return res.status(result.getStatus()).json(result)
}

export function decodeJwt(token: string, secret: string) {
	try {
		const payload = jwt.verify(token, secret)
		return {
			data: payload as { sub: string; tid: string } & IUser
		} as const
	} catch (error: any) {
		return {
			errorMessage: error?.message || 'Error in decoding token'
		} as const
	}
}
