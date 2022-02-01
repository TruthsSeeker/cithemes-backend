import axios from "axios";
import { Request } from "express";


class SpotifyController {
    private _formattedAuthorization: string = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64");

    async auth(req: Request) {
        let requestHeaders = { 
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + this._formattedAuthorization
        }
        let searchParams = new URLSearchParams()
        searchParams.append("grant_type", "client_credentials")
        
        try {
            let response = await axios.post("https://accounts.spotify.com/api/token", searchParams, { headers: requestHeaders })
            return response.data

        } catch (err) {
            return err
        }
    }

}

export = new SpotifyController()