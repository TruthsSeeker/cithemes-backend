import { knex } from '../db/knexfile'

export interface ISong {
    id?:number;
    title:string;
    album:string;
    artist:string;
    spotify_id:string;
    release:string;
    duration:number;
    preview:string;
    spotify_uri:string;
    cover:string;
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

    static async search(query: string) {
        let results = await knex<ISong>('songs')
        .where('artist', 'like', "%" + query + "%")
        .orWhere('title', 'like',  "%" + query + "%")
        .orWhere('album', 'like', "%" + query + "%")
        return results
    }

    static async createAll(songs: ISong[]){
        return await knex<ISong>('songs').insert(songs).onConflict('spotify_id').merge().returning("*")
    }

    async create() {
        let exists = await knex<ISong>('songs').first().where('spotify_id', this.data.spotify_id)
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
            await knex<ISong>('songs').where({ id: id }).del()
        } else {
            throw new Error(`No id provided`)
        }
    }

    getSpotifyUri() {
        return "spotify:track:" + this.data.spotify_id
    }

    static getSpotifyUri(spotify_id: string) {
        return "spotify:track:" + spotify_id
    }
}