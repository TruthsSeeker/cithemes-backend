import { ISong } from "../../../models/Song";
import { SpotifyQuery } from "./SpotifyQuery";

export function convert(query: SpotifyQuery): ISong[] {
    return query.tracks?.items?.map(track => {
        let result: ISong = { 
            spotify_id: track.id,
            title: track.name,
            artist: track?.artists?.map(artist => artist?.name ?? "")
                .reduce((acc, artist, index, array) => {
                    if (index === 0) {
                        acc += artist;
                    } else {
                        acc += ", " + artist;
                    }
                    return acc
            }, ""),
            album: track?.album?.name,
            release: track?.album?.release_date,
            duration: track.duration_ms,
            preview: track.preview_url ?? "",
            spotify_uri: track?.external_urls?.spotify,
            cover: track?.album?.images?.find(e=>true)?.url ?? "",
        }
        return result
    }) ?? []
}