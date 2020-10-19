package spotify

type ClientAuthResponse struct {
	Token string `json:"access_token"`
	Expires int `json:"expires_in"`
	TokenType string `json:"token_type"`
}

type Track struct {
	Album            Album         		`json:"album"`
	Artists          []Artist    		`json:"artists"`
	AvailableMarkets []interface{} 				`json:"available_markets"`
	DiscNumber       int           				`json:"disc_number"`
	DurationMs       int           				`json:"duration_ms"`
	Explicit         bool          				`json:"explicit"`
	ExternalIds      ExternalIds 		`json:"external_ids"`
	ExternalUrls     ExternalUrls		`json:"external_urls"`
	Href             string        				`json:"href"`
	ID               string        				`json:"id"`
	IsLocal          bool          				`json:"is_local"`
	IsPlayable       bool          				`json:"is_playable"`
	Name             string        				`json:"name"`
	Popularity       int           				`json:"popularity"`
	PreviewURL       string        				`json:"preview_url"`
	TrackNumber      int           				`json:"track_number"`
	Type             string        				`json:"type"`
	URI              string        				`json:"uri"`
}
type ExternalUrls struct {
	Spotify string `json:"spotify"`
}
type Artist struct {
	ExternalUrls ExternalUrls `json:"external_urls"`
	Href         string       `json:"href"`
	ID           string       `json:"id"`
	Name         string       `json:"name"`
	Type         string       `json:"type"`
	URI          string       `json:"uri"`
}
type Image struct {
	Height int    `json:"height"`
	URL    string `json:"url"`
	Width  int    `json:"width"`
}
type Album struct {
	AlbumType            string       			`json:"album_type"`
	Artists              []Artist    	`json:"artists"`
	AvailableMarkets     []string     			`json:"available_markets"`
	ExternalUrls         ExternalUrls 	`json:"external_urls"`
	Href                 string       			`json:"href"`
	ID                   string       			`json:"id"`
	Images               []Image     	`json:"images"`
	Name                 string       			`json:"name"`
	ReleaseDate          string       			`json:"release_date"`
	ReleaseDatePrecision string       			`json:"release_date_precision"`
	TotalTracks          int          			`json:"total_tracks"`
	Type                 string       			`json:"type"`
	URI                  string       			`json:"uri"`
}
type ExternalIds struct {
	Isrc string `json:"isrc"`
}