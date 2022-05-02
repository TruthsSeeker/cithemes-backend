import {Knex} from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("playlist_entries", t => {
        t.increments('id').primary()
        t.integer('song_id').references('songs.id')
        t.integer('city_id').references('cities.id')
        t.integer('votes')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("playlist_entries")

}

