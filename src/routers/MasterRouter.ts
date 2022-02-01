import { Router } from 'express'
import Knex from 'knex'
import AuthRouter from './AuthRouter'
import SpotifyRouter from './SpotifyRouter'

class MasterRouter  {
    private _router = Router()
    private _authRouter = AuthRouter
    private _spotifyRouter = SpotifyRouter

    get router() {
        return this._router
    }

    constructor() {
        this._configure()
    }

    private _configure() {
        this.router.use('/auth', this._authRouter)
        this.router.use('/music/spotify', this._spotifyRouter)
    }
}

export = new MasterRouter().router