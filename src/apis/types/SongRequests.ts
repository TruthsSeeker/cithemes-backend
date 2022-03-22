export interface IVoteRequest {
    user_id: number;
    entry_id: number;
    remove: boolean;
}

export interface ISearchRequest {
    query: string;
    city_id?: number;
}

export interface ISaveSongRequest {
    title: string;
    artist: string;
    album: string;
    duration: string;
    spotify_id: string;
    applemusic_id?: string;
}

export interface IAddToPlaylistRequest {
    city_id: number;
    song_id: number;
    user_id: number;
}