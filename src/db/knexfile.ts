import Knex from "knex"
import path from "path"

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
        directory: path.join(__dirname,'migrations')
    },
}

const knexConfig: KnexConfig = {
    development: {
        client: 'sqlite3',
        connection: {
        filename: path.join(__dirname,'dev.sqlite3')
        },
        migrations: {
        directory: path.join(__dirname,'migrations')
        },
        useNullAsDefault: true
    },

    staging: {
        ...defaults,
        client: 'pg',
        connection: {
            host: process.env.DATABASE_URL
        },
        useNullAsDefault: true,
        debug: true,
    },

    production: {
        ...defaults
    }
 
}
export default knexConfig[process.env.NODE_ENV ?? 'development']


export const knex = Knex(knexConfig[process.env.NODE_ENV ?? 'development'])

