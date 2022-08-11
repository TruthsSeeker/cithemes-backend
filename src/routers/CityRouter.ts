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

    this.router.get("/find", async (req, res) => {
      try {
        let {query} = req.query;
        let result = await this._controller.findCityByName(query?.toString() ?? '');
        res.status(200).json({ result: result });
      } catch (err) {
        res.status(500).json({ error: err });
      }
    });

    this.router.get("/:id", async (req, res) => {
      try {
        let id = parseInt(req.params.id);
        let result = await this._controller.findCityById(id);

        console.log("Result:")
        console.log(JSON.stringify(result));
        
        res.status(200).json({ result: result });
      } catch (err) {
        res.status(500).json({ error: err });
      }
    });

    this.router.get("/nearest/:lat/:lng", async (req, res) => {
      try {
        let lat = parseFloat(req.params.lat);
        let lng = parseFloat(req.params.lng);
        console.log(lat, lng);
        let result = await this._controller.nearestCities(lat, lng);
        console.log(result);
        res.status(200).json({result:result});
      } catch (err) {
        console.log(err)
        res.status(500).json({ error: err });
      }
    });

  }
}

export = new CityRouter().router;
