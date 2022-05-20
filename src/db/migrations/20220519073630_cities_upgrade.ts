import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('cities', (table) => {
    table.string('iso2', 2);
    table.string('name_ascii');
    table.string('name_alt');
    table.string('capital');
    table.double('lat');
    table.double('lng');
    table.integer('population');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('cities', (table) => {
    table.dropColumn('iso2');
    table.dropColumn('name_ascii');
    table.dropColumn('name_alt');
    table.dropColumn('capital');
    table.dropColumn('center');
    table.dropColumn('population');
  });
}

