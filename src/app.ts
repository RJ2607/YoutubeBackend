import * as bodyParser from 'body-parser'
import express from 'express'
import { initializeRoutes } from './router'

console.log('DB_PASS:', process.env.DB_PASSWORD)
const app = express()

app.use(bodyParser.json())

const apiRouter = initializeRoutes()
app.use('/api', apiRouter)

export default app
