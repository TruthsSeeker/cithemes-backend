import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';
import { knex } from '../db/knexfile'

export interface IPlaylistEntry {
    id?: number,
    song_id: number,
    city_id: number,
    votes: number,
}

export class PlaylistEntry {
    data: IPlaylistEntry

    constructor(playlistentry: IPlaylistEntry) {
        this.data = playlistentry;
    }
    
    static async find(id: number): Promise<PlaylistEntry> {
        let result = await knex<IPlaylistEntry>('playlist_entries').first().where('id', id)

        if (!!result) {
            return new PlaylistEntry(result)
        } else {
            throw new Error(`No corresponding entry found for ${id}`)
        }
    }

    async create() {
        let exists = await knex<IPlaylistEntry>('playlist_entries').first().where({
            song_id: this.data.song_id,
            city_id: this.data.city_id,
        })
        if (!exists) {
            this.data = await knex<IPlaylistEntry>('playlist_entries').insert(this.data)
        } else {
            throw new Error(`Entry already exists`)
        }
    }

    async upsert() {
        let exists = await knex<IPlaylistEntry>('playlist_entries').first().where({
            song_id: this.data.song_id,
            city_id: this.data.city_id,
        })
        if (!exists) {
            this.data = await knex<IPlaylistEntry>('playlist_entries').insert(this.data)
        } else {
            this.data = exists
        }
        console.log(this.data)
    }

    async find() {
        let result = await knex<IPlaylistEntry>('playlist_entries').first().where({
            song_id: this.data.song_id,
            city_id: this.data.city_id,
        })

        if (!!result) {
            this.data = result
            return result
        } else {
            throw new Error(`Entry not found`)
        }

    }

    async update() {
        await knex<IPlaylistEntry>('playlist_entries').where('id', this.data.id).update(this.data)
    }

    async updateVotes(change: number) {
        this.data.votes += change
        await this.update()
    }

    async delete() {
        let id = this.data.id

        if (!!id) {
            await knex<IPlaylistEntry>('playlist_entries').where('id', id).delete()
        } else {
            throw new Error(`No id provided`)
        }
    }
}