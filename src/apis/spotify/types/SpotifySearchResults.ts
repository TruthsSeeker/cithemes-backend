import { SpotifyQuery } from "./SpotifyQuery";

export interface ISpotifySearchResult {
    id?: string;
    title?: string;
    artist?: string;
    album?: string;
    score?: number;
    release?: string;
    duration?: number;
    preview?: string;
    originalSuggestion?: string;
    spotifyURI?: string;
    albumCoverURL?: string;
}

export function convert(query: SpotifyQuery): ISpotifySearchResult[] {
    return query.tracks?.items?.map(track => {
        let result: ISpotifySearchResult = { 
            id: track.id,
            title: track.name,
            artist: track?.artists?.map(artist => artist?.name ?? "")
                .reduce((acc, artist, index, array) => {
                    if (index === array.length - 1) {
                        acc += artist;
                    } else {
                        acc += ", " + artist;
                    }
                    return acc
            }, ""),
            album: track?.album?.name,
            score: 0,
            release: track?.album?.release_date,
            duration: track.duration_ms,
            preview: track.preview_url ?? undefined,
            originalSuggestion: "",
            spotifyURI: track?.external_urls?.spotify,
            albumCoverURL: track?.album?.images?.find(e=>true)?.url ?? undefined,
        }
        return result
    }) ?? []
}