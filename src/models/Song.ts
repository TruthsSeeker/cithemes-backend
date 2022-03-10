import { knex } from '../db/knexfile'

export interface ISong {
    id?:number;
    title:string;
    album:string;
    artist:string;
    spotify_id:string;
    applemusic_id:string;
}

export class Song {
    data: ISong

    constructor(song: ISong) {
        this.data = song;
    }

    static async find(id: number) {
        let result = await knex<ISong>('songs').first().where('id', id)

        if (!!result) {
            return new Song(result)
        } else {
            throw new Error(`No corresponding entry found for ${id}`)
        } 
    }

    async create() {
        let exists = await knex<ISong>('songs').first().where(this.data)
        if (!exists) {
            this.data = await knex<ISong>('songs').insert(this.data)
        } else {
            throw new Error(`Song already exists`)
        }
    }

    async update() {
        await knex<ISong>('songs').where('id', this.data.id).update(this.data)
    }

    async delete() {
        let id = this.data.id

        if (!!id) {
            await knex<ISong>('songs').where({ id: id }).delete()
        } else {
            throw new Error(`No id provided`)
        }
    }
}