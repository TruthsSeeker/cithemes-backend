package data


// GeocodingResponse internal geocoding request response type
type GeocodingResponse struct {
	Type ResultLevel `json:"type"`
	PlaceID string `json:"place_id"`
	Address string `json:"address"`
}

// ResultLevel whether the result refers to a neighbourhood or a locality
type ResultLevel int
// ResultLevel value
const (
	Locality ResultLevel = iota
	Neighbourhood
)
