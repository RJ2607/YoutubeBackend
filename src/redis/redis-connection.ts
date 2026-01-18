import { RedisPoolOptions } from '../redis/types'
import RedisPool from './redis-client'
import { RedisConnectionObjectInterface } from './types'

const dbOptions: RedisPoolOptions = {
	host: 'localhost',
	port: 6379,
	username: '',
	password: '',
	db: 0
}

const connect = async (): Promise<RedisConnectionObjectInterface> => {
	try {
		const pool = new RedisPool(dbOptions)
		return { connection: pool }
	} catch (error) {
		process.exit(1)
	}
}

export const RedisDatabaseObject = connect()

export class RediConnectionClass {
	public async getConnection(): Promise<RedisPool | null> {
		try {
			const { connection } = await RedisDatabaseObject
			if (!connection) {
				return null
			}
			return connection
		} catch (error) {
			return null
		}
	}
}

export default RedisDatabaseObject
