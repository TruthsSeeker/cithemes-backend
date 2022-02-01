import { Router } from 'express'
import jwt from 'express-jwt'
import AuthController from '../controllers/AuthController'
import { IToken } from '../models/Token'

class AuthRouter {
    private _router = Router()
    private _controller = AuthController

    get router() {
        return this._router
    }

    constructor() {
        this._configure()
    }

    async _configure() {
        this.router.get('/login', async (req, res) => {
            try {
                res.status(200).json(await this._controller.login(req))
            } catch(e) {
                res.status(400).json({error: e})
            }
        })
        this.router.post('/signup', async (req, res) => {
            try {
                res.status(200).json(await this._controller.signup(req))
            } catch(e) {
                res.status(400).json({error: e})
            }
        })
        this.router.get('/protected', jwt({secret: process.env.JWT_SECRET ?? '', algorithms: ['HS256']}), (req, res) => {
            res.status(200).json({success: "Authorized"})
        })
        this.router.get('/refresh', jwt({secret: process.env.JWT_SECRET ?? '', algorithms: ['HS256'], requestProperty: 'payload'}), async (req, res) => {
            try {
                res.status(200).json(await this._controller.refresh(req))
            } catch(e) {
                res.status(500).json({error: e})
            }
        })
    }
}   

export = new AuthRouter().router