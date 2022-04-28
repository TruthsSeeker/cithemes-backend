import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("songs", t => {
        t.increments('id').primary()
        t.string('title')
        t.string('album')
        t.string('artist')
        t.string('spotify_id')
        t.unique(['spotify_id'])
        t.string('applemusic_id')
        t.string('release')
        t.integer('duration')
        t.string('preview')
        t.string('cover')
        t.string('spotify_uri')
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('songs')
}
