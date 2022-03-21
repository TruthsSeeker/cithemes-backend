import { Router } from 'express'
import Knex from 'knex'
import AuthRouter from './AuthRouter'
import SongRouter from './SongRouter'
import SpotifyRouter from './SpotifyRouter'

class MasterRouter  {
    private _router = Router()
    private _authRouter = AuthRouter
    private _spotifyRouter = SpotifyRouter
    private _songRouter = SongRouter

    get router() {
        return this._router
    }

    constructor() {
        this._configure()
    }

    private _configure() {
        this.router.use('/auth', this._authRouter)
        this.router.use('/music/spotify', this._spotifyRouter)
        this.router.use('/songs', this._songRouter)
    }
}

export = new MasterRouter().router