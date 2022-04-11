import cors from 'cors'
import express from 'express'
import dotenv from 'dotenv'
// Load .env before importing MasterRouter so secret is set
dotenv.config({
    path: '.env'
})
import MasterRouter from './routers/MasterRouter'


const app = express()
app.use(cors())
app.use(express.json())
app.use('/', MasterRouter)
app.listen(process.env.APP_PORT, ()=>console.log(`> Listening on port ${process.env.APP_PORT}`))