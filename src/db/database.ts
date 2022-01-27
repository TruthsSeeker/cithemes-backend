import Knex from "knex"
import path from "path"
import { pathToFileURL } from "url"
interface KnexConfig {
    [key: string]: object
}
const defaults = {
client: 'mysql',
    connection: {
    host: process.env.DATABASE_URL,
    database: process.env.DATABASE_NAME,
    user:     process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
    },
    pool: {
    min: 2,
    max: 10
    },
    migrations: {
    tableName: 'knex_migrations',
    directory: 'migrations'
    },
}

const knexConfig: KnexConfig = {
    development: {
        client: 'sqlite3',
        connection: {
        filename: 'src/db/dev.sqlite3'
        },
        migrations: {
        directory: 'src/db/migrations'
        },
        useNullAsDefault: true
    },

    staging: {
        ...defaults,
        useNullAsDefault: true,
        debug: true,
    },

    production: {
        ...defaults
    }
 
}
export const config = knexConfig[process.env.NODE_ENV ?? 'development']


export const knex = Knex(knexConfig[process.env.NODE_ENV ?? 'development'])

