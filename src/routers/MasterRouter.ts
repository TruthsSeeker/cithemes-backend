import { Router } from 'express'
import Knex from 'knex'
import AuthRouter from './AuthRouter'

class MasterRouter  {
    private _router = Router()
    private _authRouter = AuthRouter

    get router() {
        return this._router
    }

    constructor() {
        this._configure()
    }

    private _configure() {
        this.router.use('/auth', this._authRouter)
    }
}

export = new MasterRouter().router