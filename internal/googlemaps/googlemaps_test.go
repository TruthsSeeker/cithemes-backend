package googlemaps

import (
	"log"
	"encoding/json"
	"reflect"
	"net/url"
	"github.com/TruthsSeeker/cithemes-backend/pkg/types"
	"github.com/TruthsSeeker/cithemes-backend/internal/utils"
	"testing"
)

func Test_FormatParameters(t *testing.T) {
	tp := url.Values{}
	key := utils.GetEnvVariable("GOOGLE_MAPS_API_KEY")
	tp.Add("key", key)
	tp.Add("latlng", "0.000000,0.000000")
	tp.Add("language", "FR")

	gr := &types.GeocodingRequest{
		Position: types.Coordinates{
			Latitude: 0.0,
			Longitude: 0.0,
		},
		Locale: "FR",
	}

	p := FormatParameters(gr)

	if !reflect.DeepEqual(tp, p) {
		prettyp, err := json.MarshalIndent(p, "", " ")
		if err != nil {
			log.Fatalln(err)
		}
		prettytp, err := json.MarshalIndent(tp, "", " ")
		if err != nil {
			log.Fatalln(err)
		}
		t.Errorf("Request Parameters weren't formatted correctly\n" +
				"expected:\n" + string(prettytp) +
				"\n\ngot:" + string(prettyp))
	}
}