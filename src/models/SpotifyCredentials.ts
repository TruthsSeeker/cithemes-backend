// SpotifyCredentials model

import { knex } from "../db/knexfile";

export interface ISpotifyCredentials {
  id?: number;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export class SpotifyCredentials {
  data: ISpotifyCredentials;

  constructor(spotifycredentials: ISpotifyCredentials) {
    this.data = spotifycredentials;
  }

  static async find(id: number): Promise<SpotifyCredentials> {
    let result = await knex<ISpotifyCredentials>("spotify_credentials")
      .first()
      .where("id", id);

    if (!!result) {
      return new SpotifyCredentials(result);
    } else {
      throw new Error(`No corresponding entry found for ${id}`);
    }
  }

  static async first(): Promise<SpotifyCredentials> {
    let result = await knex<ISpotifyCredentials>("spotify_credentials").first();
    if (!result) {
      throw new Error(`No corresponding entry found`);
    } else {
      return new SpotifyCredentials(result);
    }
  }

  async create() {
    let exists = await knex<ISpotifyCredentials>("spotify_credentials").first().where({
      user_id: this.data.user_id,
    });
    if (!exists) {
      this.data.id = await knex<ISpotifyCredentials>("spotify_credentials").insert(
        this.data
      );
    } else {
      throw new Error(`Entry already exists`);
    }
  }

  async upsert() {
    let exists = await knex<ISpotifyCredentials>("spotify_credentials").first().where({
      user_id: this.data.user_id,
    });
    if (!exists) {
      this.data.id = await knex<ISpotifyCredentials>("spotify_credentials")
        .insert(this.data)
        .returning("id");
    } else {
      await knex<ISpotifyCredentials>("spotify_credentials").update(this.data).where({
        user_id: this.data.user_id,
      });
    }
    console.log(this.data);
  }

  async find() {
    let result = await knex<ISpotifyCredentials>("spotify_credentials").first().where({
      user_id: this.data.user_id,
    });
    if (!result) {
      throw new Error(`No corresponding entry found for ${this.data.user_id}`);
    } else {
      return new SpotifyCredentials(result);
    }
  }
}