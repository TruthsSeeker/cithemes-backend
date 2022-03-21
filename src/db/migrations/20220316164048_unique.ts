import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('songs', t => {
        t.unique(['spotify_id'])
    })
}


export async function down(knex: Knex): Promise<void> {
    // await knex.schema.alterTable('songs', t => {
    //     t.dropUnique(['spotify_id'])
    // })
}

