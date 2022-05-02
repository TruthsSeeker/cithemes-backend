import {Knex} from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tokens', (t) => {
        t.dropColumn('token')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tokens', (t) => {
        t.string('token')
    })
}

