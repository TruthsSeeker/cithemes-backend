import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('songs', t => {
        t.dropColumn('duration')

    })
    await knex.schema.alterTable('songs', t => {
        t.string('release')
        t.integer('duration')
        t.string('preview')
        t.string('cover')
        t.string('spotify_URI')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('songs', t => {
        t.dropColumn('duration')
    
    })
    await knex.schema.alterTable('songs', t => {
        t.dropColumn('release')
        t.dropColumn('duration')
        t.string('duration')
        t.dropColumn('preview')
        t.dropColumn('cover')
        t.dropColumn('spotify_URI')
    })
}
