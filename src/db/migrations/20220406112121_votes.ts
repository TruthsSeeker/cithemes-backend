import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("votes", t => {
        t.increments('id').primary()
        t.integer('song_id')
        t.foreign('song_id').references('id').inTable('playlist_entries')
        t.integer('user_id')
        t.foreign('user_id').references('id').inTable('users')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("votes")

}

