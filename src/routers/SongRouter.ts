import { Router } from 'express'
import { IAddToPlaylistRequest } from '../apis/types/SongRequests'
import SongsController from '../controllers/SongsController'

class SongRouter {
    private _router = Router()
    private _controller = SongsController

    get router() {
        return this._router
    }

    constructor() {
        this._configure()
    }

    async _configure() {
        this.router.post("/search", async (req, res) => {
            try {
                res.status(200).json(await this._controller.search(req))
            } catch (err) {
                res.status(500).json({error: err})
            }
        })

        this.router.post("/vote", async (req, res) => {
            try {
                let addToPlaylist: IAddToPlaylistRequest = req.body
                res.status(200).json(await this._controller.addToPlaylist(addToPlaylist))
            } catch (error) {
                
            }
        })
    }
}

export = new SongRouter().router