import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';
import { knex } from '../db/knexfile'
import { ISong } from './Song';

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
            this.data.id = await knex<IPlaylistEntry>('playlist_entries').insert(this.data)
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
            this.data.id = await knex<IPlaylistEntry>('playlist_entries').insert(this.data)
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

    static async findPlaylist(city_id: number) {
        let result = await knex<IPlaylistEntry>('playlist_entries').where({
            city_id: city_id,
        })
            .innerJoin('songs', 'playlist_entries.song_id', 'songs.id')
            .limit(100)
            .orderBy('votes', 'desc')
            .debug(true)

        result = result.map(entry => {
            return {
                id: entry.id,
                city_id: entry.city_id,
                votes: entry.votes,
                song_info: {
                    id: entry.song_id,
                    title: entry.title,
                    artist: entry.artist,
                    album: entry.album,
                    spotify_URI: entry.spotify_URI,
                    cover: entry.cover,
                    preview: entry.preview,
                    duration: entry.duration,
                    applemusic_id: entry.applemusic_id,
                    release: entry.release,
                },
            }
        })
        
        if (!!result) {
            return result
        } else {
            throw new Error(`No corresponding entry found for ${city_id}`)
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