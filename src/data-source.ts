import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./module/User/user.entity"
import { Video } from "./module/Video/video.entity"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User,Video],
    migrations: [],
    subscribers: [],
})
