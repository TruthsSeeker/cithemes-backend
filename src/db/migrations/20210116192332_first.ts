import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', t => {
        t.increments('id').primary()
        t.string('email', 100)
        t.string('password', 100)
    })
    await knex.schema.createTable('tokens', (t) => {
        t.increments('id').primary()
        t.string('token')
        t.string('jwtid')
        t.string('email', 100)
        t.integer('user_id')
        t.foreign('user_id').references('id').inTable('users')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users')
    await knex.schema.dropTable('tokens')
}

