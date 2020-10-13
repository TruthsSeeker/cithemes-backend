package googlemaps

import(
	"fmt"
	"net/url"
	"github.com/TruthsSeeker/cithemes-location-service/internal/data"
	"github.com/TruthsSeeker/cithemes-location-service/internal/utils"
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

// type GoogleReverseGeocodingRequest struct {
// 	LatLng float64 `param:"latlng"`
// 	Language string `param:"language"`
// 	APIKey string `param:"key"`
// }

func FormatParametersForGoogleRequest(request *data.GeocodingRequest) string {
	params := url.Values{}

	key := utils.GetEnvVariable("GOOGLE_MAPS_API_KEY")
	params.Add("key", key)

	latlng := fmt.Sprintf("%f,%f", request.Position.Latitude, request.Position.Longitude)
	params.Add("latlng", latlng)

	language := request.Locale
	params.Add("language", language)
	return params.Encode()
}

