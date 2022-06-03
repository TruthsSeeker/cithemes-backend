import { knex } from "../db/knexfile";

export interface ICity {
  id?: number;
  name: string;
  country: string;
  iso2: string;
  name_ascii: string;
  name_alt: string;
  capital: string;
  lat: number;
  lng: number;
  population: number;
  center: any;
  image?: string;
}

export class City {
  data: ICity;

  constructor(city: ICity) {
    this.data = city;
  }

  static async find(id: number) {
    let result = await knex<ICity>("cities").first().where("id", id);

    if (!!result) {
      return new City(result);
    } else {
      throw new Error(`No corresponding entry found for ${id}`);
    }
  }

  static async findNeareast(lat: number, lng: number) {
    return await knex<ICity>("cities")
      .select("*")
      .orderByRaw(
        `
          point(?, ?) <-> center ASC
        `,
        [lng, lat]
      )
      .limit(10);
  }

  static async findByName(query: string) {
    let sql = knex<ICity>("cities")
      .select("*")
      .whereRaw(`name % ?`, [query])
      .limit(10);
    console.log(sql.toQuery());
    return await sql;
  }

  async create() {
    let exists = await knex<ICity>("cities").first().where(this.data);
    if (!exists) {
      this.data = await knex<ICity>("cities").insert(this.data);
    } else {
      throw new Error(`City already exists`);
    }
  }

  async update() {
    let payload = {
      name: this.data.name,
      country: this.data.country,
      iso2: this.data.iso2,
      name_ascii: this.data.name_ascii,
      name_alt: this.data.name_alt,
      capital: this.data.capital,
      lat: this.data.lat,
      lng: this.data.lng,
      population: this.data.population,
      center: this.data.center.x + "," + this.data.center.y,
      image: this.data.image,
    }
    await knex<ICity>("cities").where("id", this.data.id).update(payload);
  }

  async delete() {
    let id = this.data.id;

    if (!!id) {
      await knex<ICity>("cities").where({ id: id }).del();
    } else {
      throw new Error(`No id provided`);
    }
  }
}
