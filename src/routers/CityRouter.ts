import { Router } from "express";
import CitiesController from "../controllers/CitiesController";

class CityRouter {
  private _router = Router();
  private _controller = CitiesController;

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  async _configure() {
    this.router.post("/create", async (req, res) => {
      try {
        res.status(200).json(await this._controller.create(req));
      } catch (err) {
        res.status(500).json({ error: err });
      }
    });

    this.router.get("/:id/playlist", async (req, res) => {
      try {
        let id = parseInt(req.params.id);
        let { user_id } = req.query;
        let userId: number | undefined = user_id
          ? parseInt(user_id as string)
          : undefined;
        let result = await this._controller.getPlaylist(id, userId);
        console.log(JSON.stringify(result));
        res.status(200).json(result);
      } catch (err) {
        res.status(500).json({ error: err });
      }
    });

    this.router.get("/:query", async (req, res) => {
      try {
        let query = req.params.query;
        let result = await this._controller.findCity(query);
        res.status(200).json(result);
      } catch (err) {
        res.status(500).json({ error: err });
      }
    });
  }
}

export = new CityRouter().router;
