import {Knex} from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("votes", t => {
        t.increments('id').primary()
        t.integer('song_id').references('playlist_entries.id')
        t.integer('user_id').references('users.id')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("votes")

}

