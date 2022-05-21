import axios, { AxiosResponse } from "axios";
import { Request } from "express";
import {knex} from "../db/knexfile";
import { ForwardGeocodeResponse } from "../apis/types/CityRequests";
import { City } from "../models/City";
import { PlaylistEntry } from "../models/PlaylistEntry";

class CitiesController {
  async create(req: Request) {
    const { name, country } = req.body;
    const city = new City({ name, country });
    return await city.create();
  }

  async getPlaylist(id: number, userId: number | undefined) {
    if (!!userId) {
      return { result: await PlaylistEntry.findPlaylistWithUser(id, userId) };
    }
    return { result: await PlaylistEntry.findPlaylist(id) };
  }

  async findCity(query: string) {
    let forwardGeocodingResponse: AxiosResponse<ForwardGeocodeResponse[]> =
      await axios.get(`https://geocode.maps.co/search?q=${query}&limit=5`);
    let typeCheckNeeded = forwardGeocodingResponse.data.filter((result) => {
        let validTypes = ["town", "city", "village", "hamlet"];
        return !validTypes.includes(result.type);
    })
    if (typeCheckNeeded.length > 0) {
        //TODO: Forward geocode
    }
    let validResults = forwardGeocodingResponse.data.filter((result) => {
        let validTypes = ["town", "city", "village", "hamlet"];
        return validTypes.includes(result.type);
    }).map((result) => {
        
    })
  }

  async findNeareast(lat: number, lng: number) {
    return await knex('cities').select("*").orderByRaw(`
      point(?, ?) <-> center ASC
    `, [lng, lat]).limit(10);
  }
}

export = new CitiesController();
