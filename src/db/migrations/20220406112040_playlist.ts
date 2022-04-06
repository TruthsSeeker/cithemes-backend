import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("playlist_entries", t => {
        t.increments('id').primary()
        t.integer('song_id')
        t.foreign('song_id').references('id').inTable('songs')
        t.integer('city_id')
        t.foreign('city_id').references('id').inTable('cities')
        t.integer('votes')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("playlist_entries")

}

