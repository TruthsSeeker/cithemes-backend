import { Request } from "express";
import {
  IAddToPlaylistRequest,
  IVoteRequest,
} from "../apis/types/SongRequests";
import { Hometown } from "../models/Hometown";
import { PlaylistEntry } from "../models/PlaylistEntry";
import { ISong, Song } from "../models/Song";
import { Vote } from "../models/Vote";
import SpotifyController from "./SpotifyController";

class SongsController {
  async vote(voteData: IVoteRequest) {
    let entry = await PlaylistEntry.find(voteData.entry_id);
    await Hometown.find(voteData.user_id);
    let vote = new Vote({
      song_id: entry.data.id ?? 0,
      user_id: voteData.user_id,
    });
    await vote.find();
    console.log(vote.data);

    if (voteData.remove) {
      await vote.delete();
      await entry.updateVotes(-1);
    } else if (!vote.data.id) {
      await vote.create();
      await entry.updateVotes(1);
    }
  }

  async search(req: Request) {
    try {
      let query = req.body.query;
      let internalResults = await Song.search(query);
      if (internalResults.length < 20) {
        let spotifyResults = (await SpotifyController.search(query)).result;
        let filteredResults: ISong[] = spotifyResults.filter((result) => {
          // Filter results already present in internalResults
          let exists = internalResults.find(
            (v) => result.spotify_id === v.spotify_id
          );
          return !!!exists;
        });
        if (filteredResults.length > 0) {
          filteredResults = await Song.createAll(filteredResults);
          internalResults.push(...filteredResults);
        }
      }
      return { result: internalResults };
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async addToPlaylist(data: IAddToPlaylistRequest) {
    await Hometown.find(data.user_id);

    let entry = new PlaylistEntry({
      song_id: data.song_id,
      city_id: data.city_id,
      votes: 0,
    });
    await entry.upsert();
    if (!!entry.data.id) {
      await this.vote({
        user_id: data.user_id,
        entry_id: entry.data.id,
        remove: data.remove,
      });
    }
    return entry.data.song_id;
  }
}

export = new SongsController();
