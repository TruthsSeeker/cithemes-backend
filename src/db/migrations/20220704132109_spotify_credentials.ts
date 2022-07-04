import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  //add table here
  await knex.schema.createTable("spotify_credentials", (table) => {
    table.increments("id");
    table.string("access_token");
    table.string("refresh_token");
    table.integer("expires_in");
    table.string("token_type");
    table.string("scope");
    table.string("user_id");
    table.timestamps(true, true);
  })
}


export async function down(knex: Knex): Promise<void> {
  //remove table here
  await knex.schema.dropTable("spotify_credentials");
}

