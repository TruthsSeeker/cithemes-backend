import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`create extension if not exists "pgcrypto"`);
  await knex.schema.alterTable("cities", table => {
    table.string("hash");
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("cities", table => {
    table.dropColumn("hash");
  });
  await knex.raw(`drop extension if exists "pgcrypto"`);
}

