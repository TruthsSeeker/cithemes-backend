import { Router } from "express"
import SpotifyController from "../controllers/SpotifyController"

class SpotifyRouter {
    private _router = Router()
    private _controller = SpotifyController

    get router() {
        return this._router
    }

    constructor() {
        this._configure()
    }

    async _configure() {
        this.router.get('/auth', async (req, res, next) => {
            try {
                res.status(200).json(await this._controller.auth(req))
            } catch (err) {
                res.status(500).json({error:err})
            }
        })
    }
}   

export = new SpotifyRouter().router