export interface IVoteRequest {
    user_id: string;
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
    city_id: string;
    song_id: string;
}