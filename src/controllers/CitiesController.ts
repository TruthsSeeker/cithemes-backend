import { Request } from "express";
import { City } from "../models/City";

class CitiesController {
    async create(req: Request) {
        const { name, country } = req.body;
        const city = new City({ name, country });
        return await city.create();
    }
}

export = new CitiesController();

