import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("cities", table => {
    table.string("hash");
    table.boolean("has_changed").defaultTo(false);
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("cities", table => {
    table.dropColumn("hash");
    table.dropColumn("has_changed");
  });
}

