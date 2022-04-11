import { Router } from "express";
import CitiesController from "../controllers/CitiesController";

class CityRouter {
    private _router = Router()
    private _controller = CitiesController

    get router() {
        return this._router
    }

    constructor() {
        this._configure()
    }

    async _configure() {
        this.router.post("/create", async (req, res) => {
            try {
                res.status(200).json(await this._controller.create(req))
            } catch (err) {
                res.status(500).json({error: err})
            }
        })

        this.router.get("/:id/playlist", async (req, res) => {
            try {
                let id = parseInt(req.params.id)
                res.status(200).json(await this._controller.getPlaylist(id))
            } catch (err) {
                res.status(500).json({error: err})
            }
        })
    }
    
}

export = new CityRouter().router