import { knex } from "../db/knexfile";
import crypto from "crypto";
import { ICity } from "./City";
import { IPlaylistEntry } from "./PlaylistEntry";

export interface IPlaylist {
    city_id: number;
    name: string;
    spotify_id?: string;
    hash?: string;
}

export default class Playlist {
  data: IPlaylist;

  constructor(playlist: IPlaylist) {
    this.data = playlist;
  }
  // get all cities flagged as changed from the database
  static async getChangedCities() {
    return await knex<ICity>("cities")
      .select("*")
      .where("has_changed", true);
  }


  // Compute playlist hash by concatenating then hashing the ids of each playlist entry whose city_id matches this city's id
  async computePlaylistHash() {
    let playlistEntries = await knex<IPlaylistEntry>("playlist_entries")
      .where("city_id", this.data.city_id)
      .orderBy("votes", "desc")
      .limit(100);
    let playlistIds = playlistEntries.map((entry) => entry.id);
    let playlistHash = playlistIds.join("-");
    return crypto.createHash("sha256").update(playlistHash).digest("base64");
  }
  
  // reset changed cities and update hash
  async cleanupCity() {
    let hash = await this.computePlaylistHash();
    await knex<ICity>("cities").where("id", this.data.city_id).update({ has_changed: false, hash: hash });
  }

  async comparePlaylistHash() {
    let computedHash = await this.computePlaylistHash();
    await this.getCurrentHash();
    return computedHash === this.data.hash;
  }

  async getCurrentHash() {
    let city = await knex<ICity>("cities").first().where("id", this.data.city_id).select("hash");
    this.data.hash = city?.hash;
  }
}