package googlemaps

import(
	"fmt"
	"net/url"
	"github.com/TruthsSeeker/cithemes-backend/internal/data"
	"github.com/TruthsSeeker/cithemes-backend/internal/utils"
)

// GoogleReverseGeocodingResponse struct to unmarshal a Google Maps Platform reverse geocoding response
type GoogleReverseGeocodingResponse struct {
	Results []struct {
		Address string `json:"formatted_address"`
		PlaceID string `json:"place_id"`
		Types []string `json:"types"`
		Geometry struct {
			Bounds struct {
				Northeast data.Coordinates `json:"northeast"`
				Southwest data.Coordinates `json:"southwest"`
			} `json:"bounds"`
		} `json:"geometry"`
	} `json:"results"`
	Status string `json:"status"`
}

var ApiURL = "https://maps.googleapis.com/maps/api"

// FormatParameters formats a data.GeocodingRequest into URL encoded GET parameters ready to be consumed by Google Maps' API
func FormatParameters(request *data.GeocodingRequest) url.Values {
	params := url.Values{}

	key := utils.GetEnvVariable("GOOGLE_MAPS_API_KEY")
	params.Add("key", key)

	latlng := fmt.Sprintf("%f,%f", request.Position.Latitude, request.Position.Longitude)
	params.Add("latlng", latlng)

	language := request.Locale
	params.Add("language", language)
	return params
}

