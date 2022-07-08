import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("cities", table => {
    table.string("playlist_id");
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("cities", table => {
    table.dropColumn("playlist_id");
  });
}

