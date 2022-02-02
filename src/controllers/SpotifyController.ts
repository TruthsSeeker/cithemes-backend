import axios, { AxiosResponse } from "axios";
import { Request } from "express";
import cache from 'memory-cache';
import { SpotifyTokenResponse } from "../apis/spotify/types/SpotifyTokenResponse";


class SpotifyController {
    private _formattedAuthorization: string = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64");
 
    async auth(req: Request) {
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

    async search(req: Request) {
        let headers = await this._getAuthHeaders(req)

        let searchParams = new URLSearchParams()
        searchParams.append("q", req.body.query)
        searchParams.append("type", "track,artist")
        
        let response = await axios.get("https://api.spotify.com/v1/search?" + searchParams.toString(), { headers: headers })
        return response.data
    }

    private _cacheToken(token: SpotifyTokenResponse) {
        cache.put("SpotifyToken", token.access_token, token.expires_in * 1000)
    }

    private async _getAuthHeaders(req: Request) {
        if (!cache.get("SpotifyToken")) {
            await this.auth(req)
        }
        return {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + cache.get("SpotifyToken")
        }
        
    }

}

export = new SpotifyController()