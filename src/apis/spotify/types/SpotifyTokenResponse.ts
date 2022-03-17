// To parse this data:
//
//   import { Convert, SpotifyToken } from "./file";
//
//   const spotifyToken = Convert.toSpotifyToken(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface SpotifyTokenResponse {
    access_token: string;
    token_type:   string;
    expires_in:   number;
}