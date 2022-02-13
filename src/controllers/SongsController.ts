import { Request } from "express";
import { IVoteRequest } from '../apis/types/SongRequests'
import { PlaylistEntry } from "../models/PlaylistEntry";
import { Song } from "../models/Song";
import { Vote } from "../models/Vote";

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

    }
}

export = new SongsController();