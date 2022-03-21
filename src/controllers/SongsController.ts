import { Request } from "express";
import { ISpotifySearchResult } from "../apis/spotify/types/SpotifySearchResults";
import { IVoteRequest } from '../apis/types/SongRequests'
import { PlaylistEntry } from "../models/PlaylistEntry";
import { ISong, Song } from "../models/Song";
import { Vote } from "../models/Vote";
import SpotifyController from "./SpotifyController";

class SongsController {
    async vote(voteData: IVoteRequest) {
        let vote = new Vote({song_id: voteData.entry_id, user_id: voteData.user_id});
        let entry = await PlaylistEntry.find(voteData.entry_id);

        if (voteData.remove) {
            await vote.find()
            await vote.delete()
            await entry.updateVotes(-1)
        } else {
            await vote.create()
            await entry.updateVotes(1)
        }
    }

    async search(req: Request) {
        try {
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
                        let exists =  internalResults
                            .find(v => result.spotify_id === v.spotify_id)
                        return !!!exists
                    }))
                if (transformedResults.length > 0) {
                    await Song.createAll(transformedResults)
                    internalResults.push(...transformedResults)
                }
            }
            return internalResults
        } catch(err) {
            console.log(err)
            return err
        }
    }

    async addToPlaylist(songId: number, cityId: number) {
        let entry = new PlaylistEntry({song_id: songId, city_id: cityId, votes: 0})
        await entry.create()
    }
}

export = new SongsController();