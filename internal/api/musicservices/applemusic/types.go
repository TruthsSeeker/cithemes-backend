package applemusic

type GetSongsRequest struct {
	Data []Data `json:"data"`
}
type Previews struct {
	URL string `json:"url"`
}
type Artwork struct {
	Width      int    `json:"width"`
	Height     int    `json:"height"`
	URL        string `json:"url"`
	BgColor    string `json:"bgColor"`
	TextColor1 string `json:"textColor1"`
	TextColor2 string `json:"textColor2"`
	TextColor3 string `json:"textColor3"`
	TextColor4 string `json:"textColor4"`
}
type PlayParams struct {
	ID   string `json:"id"`
	Kind string `json:"kind"`
}
type Attributes struct {
	Previews         []Previews `json:"previews"`
	Artwork          Artwork    `json:"artwork"`
	ArtistName       string     `json:"artistName"`
	URL              string     `json:"url"`
	DiscNumber       int        `json:"discNumber"`
	GenreNames       []string   `json:"genreNames"`
	DurationInMillis int        `json:"durationInMillis"`
	ReleaseDate      string     `json:"releaseDate"`
	Name             string     `json:"name"`
	Isrc             string     `json:"isrc"`
	HasLyrics        bool       `json:"hasLyrics"`
	AlbumName        string     `json:"albumName"`
	PlayParams       PlayParams `json:"playParams"`
	TrackNumber      int        `json:"trackNumber"`
	ComposerName     string     `json:"composerName"`
}

type Artists struct {
	Href string `json:"href"`
	Data []Data `json:"data"`
}
type Albums struct {
	Href string `json:"href"`
	Data []Data `json:"data"`
}
type Relationships struct {
	Artists Artists `json:"artists"`
	Albums  Albums  `json:"albums"`
}
type Data struct {
	ID            string        `json:"id"`
	Type          string        `json:"type"`
	Href          string        `json:"href"`
	Attributes    Attributes    `json:"attributes"`
	Relationships Relationships `json:"relationships"`
}

type Storefronts struct {
	Data []StorefrontData `json:"data"`
}

type StorefrontAttributes struct {
	ExplicitContentPolicy string   `json:"explicitContentPolicy"`
	SupportedLanguageTags []string `json:"supportedLanguageTags"`
	Name                  string   `json:"name"`
	DefaultLanguageTag    string   `json:"defaultLanguageTag"`
}

type StorefrontData struct {
	ID         string     `json:"id"`
	Type       string     `json:"type"`
	Href       string     `json:"href"`
	Attributes Attributes `json:"attributes"`
}

