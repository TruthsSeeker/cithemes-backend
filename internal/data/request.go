package data

// GeocodingRequest Geocoding request format
type GeocodingRequest struct {
	Position Coordinates `json:"coordinates"`
	Locale string `json:"locale"`
}