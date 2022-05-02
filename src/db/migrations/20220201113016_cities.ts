import {Knex} from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("cities", t => {
        t.increments('id').primary()
        t.string('name')
        t.string('country')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("cities")
}

