import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
  `);
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS cities_search_idx
      ON cities
      USING gin(name gin_trgm_ops);
  `);

}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    DROP INDEX IF EXISTS cities_search_idx;
  `);
  await knex.schema.raw(`
    DROP EXTENSION IF EXISTS pg_trgm;
  `);
}

