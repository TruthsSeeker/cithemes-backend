import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('hometowns', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('users.id').notNullable();
    table.integer('city_id').unsigned().references('cities.id').notNullable();
    table.timestamps(true, true);
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('hometowns');
}

