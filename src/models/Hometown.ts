import { knex } from "../db/knexfile";
import { HometownError } from "../utils/errors";

export interface IHometown {
  id?: number;
  user_id: number;
  city_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export class Hometown {
  data: IHometown;

  constructor(hometown: IHometown) {
    this.data = hometown;
  }

  static async find(id: number) {
    let result = await knex<IHometown>("hometowns").first().where("id", id);

    if (!!result) {
      return new Hometown(result);
    } else {
      throw new HometownError(`No corresponding entry found for ${id}`);
    }
  }

  static async findByUserId(userId: number) {
    return await knex<IHometown>("hometowns")
      .select("*")
      .first()
      .where("user_id", userId);
  }

  static async findByCityId(cityId: number) {
    return await knex<IHometown>("hometowns")
      .select("*")
      .first()
      .where("city_id", cityId);
  }

  async create() {
    let exists = await knex<IHometown>("hometowns")
      .first()
      .where("city_id", this.data.city_id)
      .andWhere("user_id", this.data.user_id);
    if (!exists) {
      this.data.created_at = new Date();
      this.data.updated_at = new Date();
      this.data = (await knex<IHometown>("hometowns").insert(this.data).returning('*'))[0];
      return this.data;
    } else {
      throw new Error(`Hometown already exists`);
    }
  }

  async update() {
    let exists = await knex<IHometown>("hometowns")
      .first()
      .where("city_id", this.data.city_id)
      .andWhere("user_id", this.data.user_id);
    if (exists) {
      this.data.updated_at = new Date();
      try {
        await knex<IHometown>("hometowns").update(this.data).where("id", this.data.id);
      } catch (error) {
        console.log(error);
        throw new Error(`Hometown update failed`);
      }
      return this.data;
    } else {
      throw new Error(`Hometown does not exist`);
    }
  }

  async delete() {
    let exists = await knex<IHometown>("hometowns")
      .first()
      .where("city_id", this.data.city_id)
      .andWhere("user_id", this.data.user_id);
    if (exists) {
      await knex<IHometown>("hometowns").where("id", this.data.id).del();
    } else {
      throw new Error(`Hometown does not exist`);
    }
  }
}
