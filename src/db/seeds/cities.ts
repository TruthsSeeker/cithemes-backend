import { Knex } from "knex";
import path from "path";
import readCitiesCSV from "../import_cities";

export async function seed(knex: Knex): Promise<void> {
    await knex("cities").del();

    // Inserts seed entries
    await knex.raw(`
        COPY cities
        FROM '${path.join(__dirname, '../../data/cities.csv')}'
        DELIMITER ','
        CSV HEADER;
    `); 
};
