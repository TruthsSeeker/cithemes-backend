import axios, { AxiosResponse } from "axios";
import { Request } from "express";
import cache from 'memory-cache';
import { SpotifyTokenResponse } from "../apis/spotify/types/SpotifyTokenResponse";
import { SpotifyQuery } from "../apis/spotify/types/SpotifyQuery";
import { convert as convertToResponse }  from "../apis/spotify/types/SpotifySearchResults";

class SpotifyController {
    private _formattedAuthorization: string = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64");
 
    async auth() {
        let requestHeaders = { 
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + this._formattedAuthorization
        }
        let searchParams = new URLSearchParams()
        searchParams.append("grant_type", "client_credentials")
        let response: AxiosResponse<SpotifyTokenResponse> = await axios.post("https://accounts.spotify.com/api/token", searchParams, { headers: requestHeaders })
        this._cacheToken(response.data)
        return response.data.access_token
    }

    async loginCallback(req: Request) {
        let {code, state} = req.query
        if (state !== cache.get("SpotifyState")) {
            throw "Invalid state"
        }
        let searchParams = new URLSearchParams()
        searchParams.append("grant_type", "authorization_code")
        searchParams.append("code", code as string)
        searchParams.append("redirect_uri", process.env.SPOTIFY_REDIRECT_URI ?? "")
        let response: AxiosResponse<SpotifyTokenResponse> = await axios.post("https://accounts.spotify.com/api/token", searchParams, { headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + this._formattedAuthorization
        }})
        this._cacheToken(response.data)
        return response.data.access_token
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
        return {"result": tracks}
    }

    // cache the token
    private _cacheToken(token: SpotifyTokenResponse) {
        cache.put("SpotifyToken", token.access_token, token.expires_in * 1000)
    }

    // get formatted authorization headers
    private async _getAuthHeaders() {
        if (!cache.get("SpotifyToken")) {
            await this.auth()
        }
        return {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + cache.get("SpotifyToken")
        }
        
    }

}

export = new SpotifyController()