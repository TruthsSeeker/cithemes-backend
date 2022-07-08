import axios from "axios";
import SpotifyController from "../controllers/SpotifyController";
import { knex } from "../db/knexfile";
import { ICity } from "../models/City";
import Playlist from "../models/Playlist";
import { PlaylistEntry } from "../models/PlaylistEntry";
import { Song } from "../models/Song";

const spotifyController = SpotifyController

export default async function update() {
  let playlists = await getPlaylists();
  setAxios();

  // update each playlist
  await iteratePlaylists(playlists);
}

// get all cities flagged as changed from the database
async function getChangedCities() {
  return await knex<ICity>("cities")
    .select("*")
    .where("has_changed", true);
}

// recursively update all playlists
async function iteratePlaylists(playlists: Playlist[]) {
  let playlist = playlists.shift();
  if (!playlist) {
    return;
  }

  // get playlist entries for this playlist
  let playlistEntries = await PlaylistEntry.findPlaylist(playlist.data.city_id);

  // format playlist entries for Spotify API
  let uris = playlistEntries.map((entry) => Song.getSpotifyUri(entry.song_info.spotify_id));

  let spotify_id = playlist.data.spotify_id;

  // if playlist doesn't exist, create it
  if (!spotify_id) {
    let response = await SpotifyController.createPlaylist(playlist.data.name);
    spotify_id = response.id;
  }

  // update playlist
  await SpotifyController.updatePlaylist(spotify_id, uris);

  // cleanup
  await cleanupCity(playlist);

  // setTimeout to throttle requests without blocking the main thread
  setTimeout(async () => {
    await iteratePlaylists(playlists);
  }, 100);
}

async function getPlaylists() {
  let changedCities = await getChangedCities();

  // create Playlist objects for each city
  let playlists = changedCities.map((city) => {
    return new Playlist({ city_id: city.id ?? -1, hash: city.hash, name: city.name + ", " + city.iso2});
  });
  // filter out any playlists that don't need to be updated
  playlists.filter((playlist) => playlist.comparePlaylistHash());
  return playlists;
}

// reset changed cities and update hash
async function cleanupCity(playlist: Playlist) {
  let hash = await playlist.computePlaylistHash();
  await knex<ICity>("cities").where("city_id", playlist.data.city_id).update({ has_changed: false, hash: hash });
}

// set axios instance with retry logic on controller
function setAxios() {
  let instance = spotifyController.axiosInstance;

  instance.interceptors.response.use(
    undefined, // success
    (error) => { // error
      if (error.response.status === 429) {
        console.log("Rate limit exceeded, waiting...");
        let retryAfter = error.response.headers["retry-after"] as number; // retry-after is a number in seconds
        let wait = retryAfter * 1000;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(instance.request(error.config));
          }, wait);
        });
      } else {
        return Promise.reject(error);
      }
    }
  );
  spotifyController.axiosInstance = instance;
}