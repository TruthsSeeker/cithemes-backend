import { knex } from '../db/database'

export interface IPlaylistEntry {
}

export class PlaylistEntry {
    data?: IPlaylistEntry

    constructor(playlistentry: IPlaylistEntry) {
        this.data = playlistentry;
    }
}