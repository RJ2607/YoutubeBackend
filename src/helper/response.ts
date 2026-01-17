export class Result<T> implements IResult<T> {
	status?: Status
	message?: string
	result?: T
	count?: number

	constructor({
		status,
		code,
		error,
		message,
		result,
		count
	}: {
		status?: Status
		code?: ErrorCode
		error?: boolean
		message?: string
		result?: T
		count?: number
	}) {
		if (status) {
			this.status = status
		} else {
			this.status = new Status({ code, error })
		}

		this.message = message
		this.result = result
		this.count = count
	}

	static dioError(message: string = ''): Result<null> {
		return new Result<null>({
			code: ErrorCode.Test,
			error: true,
			message: message
		})
	}

	getStatus(): number {
		return this.status ? parseInt(this.status.code) : parseInt(ErrorCode.Test, 10)
	}
}

export interface IResult<T> {
	status?: Status
	message?: string
	result?: T
	count?: number
}

export class Status {
	code: ErrorCode
	error: boolean

	constructor({ code = ErrorCode.Test, error = false }: { code?: ErrorCode; error?: boolean }) {
		this.code = code
		this.error = error
	}
}

export enum ErrorCode {
	Success = '200',
	Created = '201',
	BadRequest = '400',
	NotAuthorized = '401',
	NotFound = '404',
	NoUpdatesPerformed = '405',
	InternalServerError = '500',
	Test = '-1'
}
