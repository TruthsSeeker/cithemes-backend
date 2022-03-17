import { Request } from "express";
import { ISpotifySearchResult } from "../apis/spotify/types/SpotifySearchResults";
import { IVoteRequest } from '../apis/types/SongRequests'
import { PlaylistEntry } from "../models/PlaylistEntry";
import { ISong, Song } from "../models/Song";
import { Vote } from "../models/Vote";
import SpotifyController from "./SpotifyController";

class SongsController {
    async vote(req: Request) {
        let data: IVoteRequest = req.body;
        let vote = new Vote({song_id: data.entry_id, user_id: data.user_id});
        let entry = await PlaylistEntry.find(data.entry_id);

        if (data.remove) {
            await vote.find()
            await vote.delete()
            await entry.updateVotes(-1)
        } else {
            await vote.create()
            await entry.updateVotes(1)
        }
    }

    async search(req: Request) {
        let query = req.body.query
        let internalResults = await Song.search(query)
        if (internalResults.length < 20) {
            let spotifyResults = (await SpotifyController.search(query)).result
            let transformedResults: ISong[] = spotifyResults
                .map((result) => {
                    return {
                        title: result.title ?? "",
                        album: result.album ?? "",
                        artist: result.artist ?? "",
                        spotify_id: result.id ?? ""
                    }
                })
                .filter((result => { // Filter results already present in internalResults
                    !internalResults
                        .find(v => result.spotify_id === v.spotify_id)
                }))
            await Song.createAll(transformedResults)
            internalResults.push(...transformedResults)
        }
        return internalResults
    }

    async addToPlaylist(req: Request) {
        let songId: number = req.body.song_id
        let cityId: number = req.body.city_id

        let entry = new PlaylistEntry({song_id: songId, city_id: cityId, votes: 0})
        await entry.create()
    }
}

export = new SongsController();