import Knex from "knex"
import path from "path"

import dotenv from 'dotenv'

dotenv.config({
    path: '../../.env'
})

interface KnexConfig {
    [key: string]: object
}

const defaults = {
    client: 'mysql2',
    connection: {
        host:       process.env.DB_HOST,
        database:   process.env.DB_NAME,
        user:       process.env.DB_USER,
        password:   process.env.DB_PASSWORD,
        port:       process.env.DB_PORT,
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
        client: 'mysql2',
    connection: {
        host:       process.env.DB_HOST,
        database:   process.env.DB_NAME,
        user:       process.env.DB_USER,
        password:   process.env.DB_PASSWORD,
        port:       process.env.DB_PORT,
    },
    migrations: {
        tableName: 'knex_migrations',
        directory: path.join(__dirname,'migrations')
    },
        useNullAsDefault: true
    },

    staging: {
        ...defaults,
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            user:     process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port:    process.env.DB_PORT,
            ssl: {rejectUnauthorized: false}
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

