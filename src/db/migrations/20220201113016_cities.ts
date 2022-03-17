import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("cities", t => {
        t.increments('id').primary()
        t.string('name')
        t.string('country')
    })

    await knex.schema.createTable("songs", t => {
        t.increments('id').primary()
        t.string('title')
        t.string('album')
        t.string('artist')
        t.string('duration')
        t.string('spotify_id')
        t.string('applemusic_id')
    })

    await knex.schema.createTable("playlist_entries", t => {
        t.increments('id').primary()
        t.integer('song_id')
        t.foreign('song_id').references('id').inTable('songs')
        t.integer('city_id')
        t.foreign('city_id').references('id').inTable('cities')
        t.integer('votes')
    })

    await knex.schema.createTable("votes", t => {
        t.increments('id').primary()
        t.integer('song_id')
        t.foreign('song_id').references('id').inTable('playlist_entries')
        t.string('user_id')
        t.foreign('user_id').references('uuid').inTable('users')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("cities")
    await knex.schema.dropTable("songs")
    await knex.schema.dropTable("playlist_entries")
    await knex.schema.dropTable("votes")
}

