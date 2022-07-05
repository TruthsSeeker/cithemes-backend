import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Request } from "express";
import cache from 'memory-cache';
import { SpotifyTokenResponse } from "../apis/spotify/types/SpotifyTokenResponse";
import { SpotifyQuery } from "../apis/spotify/types/SpotifyQuery";
import { convert as convertToResponse } from "../apis/spotify/types/SpotifySearchResults";
import { SpotifyUserResponse } from "../apis/spotify/types/SpotifyUserResponse";
import { ISpotifyCredentials, SpotifyCredentials } from "../models/SpotifyCredentials";
import { AuthError } from "../utils/errors";
import { textChangeRangeIsUnchanged } from "typescript";
import { SpotifyCreatePlaylistResponse } from "../apis/spotify/types/SpotifyCreatePlaylistResponse";
import { SpotifyUpdatePlaylistResponse } from "../apis/spotify/types/SpotifyUpdatePlaylistResponse";

enum AuthenticationType {
    basic = "Basic",
    bearer = "Bearer"
}
class SpotifyController {
    private _formattedAuthorization: string = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64");


    // authenticate the user
    async auth() {
        if (!cache.get("SpotifyToken")) {
            let credentials = await SpotifyCredentials.first();
            if (!credentials) {
                throw new AuthError("No credentials found, please authenticate at: " + this.getLoginUrl());
            } else {
                this.refreshToken(credentials);
            }
        }

    }
    // get the user's credentials
    async loginCallback(req: Request) {
            let { code, state } = req.query
            if (state !== cache.get("SpotifyState")) {
                throw "Invalid state"
            }
            let searchParams = new URLSearchParams()
            searchParams.append("grant_type", "authorization_code")
            searchParams.append("code", code as string)
            searchParams.append("redirect_uri", process.env.SPOTIFY_REDIRECT_URI ?? "")
            let response: AxiosResponse<SpotifyTokenResponse> = await axios.post("https://accounts.spotify.com/api/token", searchParams, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + this._formattedAuthorization
                }
            })
            this._cacheToken(response.data)
            await this.saveToken(response.data)
            return { result: "success" }
        }

    //generate a spotify login url  and return it
    async getLoginUrl() {
            let state = this._generateState();
            let searchParams = new URLSearchParams()
            searchParams.append("client_id", process.env.SPOTIFY_CLIENT_ID ?? "")
            searchParams.append("response_type", "code")
            searchParams.append("redirect_uri", process.env.SPOTIFY_REDIRECT_URI ?? "")
            searchParams.append("state", state)
            searchParams.append("scope", "user-read-private user-read-email playlist-modify-public")
            return "https://accounts.spotify.com/authorize?" + searchParams.toString()
        }

    // generate a spotify state
    private _generateState() {
        let state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        cache.put("SpotifyState", state, 3600);
        return state;
    }

    // search for songs
    async search(query: string) {
        let headers = await this._getAuthHeaders()

        let searchParams = new URLSearchParams()
        searchParams.append("q", query)
        searchParams.append("type", "track,artist")

        let response: AxiosResponse<SpotifyQuery> = await axios.get("https://api.spotify.com/v1/search?" + searchParams.toString(), { headers: headers })
        console.log(response.data)
        let tracks = convertToResponse(response.data)
        console.log(tracks)
        return { "result": tracks }
    }

    // cache the token
    private _cacheToken(token: SpotifyTokenResponse) {
        cache.put("SpotifyToken", token.access_token, token.expires_in * 1000)
    }

    //save token to db
    async saveToken(token: SpotifyTokenResponse) {
        let headers = await this._getAuthHeaders()
        let response: AxiosResponse<SpotifyUserResponse> = await axios.get("https://api.spotify.com/v1/me", { headers: headers })
        let credentials: ISpotifyCredentials = {
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires_in: token.expires_in,
            token_type: token.token_type,
            scope: token.scope,
            user_id: response.data.id,
            created_at: new Date(),
            updated_at: new Date()
        }
        let model = new SpotifyCredentials(credentials)
        await model.upsert()
    }

    // get formatted authorization headers
    private async _getAuthHeaders(type: AuthenticationType = AuthenticationType.bearer) {
        switch (type) {
            case AuthenticationType.basic:
                return {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + this._formattedAuthorization
                }
            case AuthenticationType.bearer:
                if (!cache.get("SpotifyToken")) {
                    await this.refreshToken()
                }
                return {
                    "Content-Type": "application/json",
                    "Authorization": type + " " + cache.get("SpotifyToken")
                }
        }
    }

    // refresh the token
    private async refreshToken(credentials?: SpotifyCredentials) {
        if (!credentials) {
            credentials = await SpotifyCredentials.first()
        }
        let headers = await this._getAuthHeaders(AuthenticationType.basic)
        let searchParams = new URLSearchParams()
        searchParams.append("grant_type", "refresh_token")
        searchParams.append("refresh_token", credentials.data.refresh_token)
        let response: AxiosResponse<SpotifyTokenResponse> = await axios.post("https://accounts.spotify.com/api/token", searchParams, { headers: headers })
        this._cacheToken(response.data)

        credentials.data.access_token = response.data.access_token
        credentials.data.refresh_token = response.data.refresh_token
        credentials.data.expires_in = response.data.expires_in
        credentials.data.token_type = response.data.token_type
        credentials.data.scope = response.data.scope
        credentials.data.updated_at = new Date()
        await credentials.upsert()
        return response.data.access_token
    }

    // Create a playlist
    async createPlaylist(name: string) {
        let headers = await this._getAuthHeaders()
        
        let credentials = await SpotifyCredentials.first()
        let searchParams = new URLSearchParams()
        searchParams.append("name", name)
        let response: AxiosResponse<SpotifyCreatePlaylistResponse> = await axios.post("https://api.spotify.com/v1/users/" + credentials.data.user_id + "/playlists", {name: name}, { headers: headers })
        return response.data
    }

    // TODO: format spotify URIs from ids
    // Update a playlist's items
    async updatePlaylist(playlistId: string, items: string[]) {
        let headers = await this._getAuthHeaders()
        let searchParams = new URLSearchParams()
        searchParams.append("uris", items.join(","))
        let response: AxiosResponse<SpotifyUpdatePlaylistResponse> = await axios.put("https://api.spotify.com/v1/playlists/" + playlistId + "/tracks", {uris: items}, { headers: headers })
        return response.data
    }
        
}

    export = new SpotifyController()