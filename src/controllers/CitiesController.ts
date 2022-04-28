import { Request } from "express";
import { City } from "../models/City";
import { PlaylistEntry } from "../models/PlaylistEntry";

class CitiesController {
    async create(req: Request) {
        const { name, country } = req.body;
        const city = new City({ name, country });
        return await city.create();
    }

    async getPlaylist(id: number, userId: number|undefined) {
        if (!!userId) {
            return {result: await PlaylistEntry.findPlaylistWithUser(id, userId)}
        }
        return {result: await PlaylistEntry.findPlaylist(id)}
    }
}

export = new CitiesController();

