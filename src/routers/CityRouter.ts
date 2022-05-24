import { Router } from "express";
import CitiesController from "../controllers/CitiesController";
import { City } from "../models/City";
import { ApiError } from "../utils/errors";

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

    this.router.get("/find/:query", async (req, res) => {
      try {
        let query = req.params.query;
        let result = await this._controller.findCity(query);
        res.status(200).json(result);
      } catch (err) {
        res.status(500).json({ error: err });
      }
    });

    this.router.get("/nearest/:lat/:lng", async (req, res) => {
      try {
        let lat = parseFloat(req.params.lat);
        let lng = parseFloat(req.params.lng);
        let result = await this._controller.nearestCities(lat, lng);
        res.status(200).json(result);
      } catch (err) {
        res.status(500).json({ error: err });
      }
    });

    this.router.get("/place", async (req, res) => {
      try {
        let city = await City.find(1)
        let result = await this._controller.findPlace((city.data));
        res.status(200).json(result);
      } catch (err) {
        if (err instanceof ApiError) {
          res.status(err.status).json({ error: err.message });
        } else {
          res.status(500).json({ error: err });
        }
      }
    });
  }
}

export = new CityRouter().router;
