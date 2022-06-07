import { Router } from "express";
import { IAddToPlaylistRequest } from "../apis/types/SongRequests";
import SongsController from "../controllers/SongsController";
import { HometownError } from "../utils/errors";

class SongRouter {
  private _router = Router();
  private _controller = SongsController;

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  async _configure() {
    this.router.post("/search", async (req, res) => {
      try {
        let result = await this._controller.search(req);
        console.log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(500).json({ error: err });
      }
    });

    this.router.post("/vote", async (req, res) => {
      try {
        let addToPlaylist: IAddToPlaylistRequest = req.body;
        let result = await this._controller.addToPlaylist(addToPlaylist);
        console.log(JSON.stringify(result));
        res.status(200).json({ result: result });
      } catch (error) {
        console.log(error);
        if (error instanceof HometownError) {
          res.status(error.status).json({ error: error.message });
        } else {
          res.status(500).json({ error: error });
        }
      }
    });
  }
}

export = new SongRouter().router;
