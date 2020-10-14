package api

import (
	"encoding/json"
	"fmt"
	"github.com/TruthsSeeker/cithemes-backend/internal/data"
	"github.com/TruthsSeeker/cithemes-backend/internal/googlemaps"
	"io/ioutil"
	"log"
	"net/http"
)

func geocodingRequestHandler(w http.ResponseWriter, r *http.Request) {
	var regeocodingrequest data.GeocodingRequest
	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatalln("Error reading the body:\n", err)
	}

	err = json.Unmarshal(body, &regeocodingrequest)

	if err != nil {
		log.Fatalln("Error unmarshalling the body:\n", err)
	}

	results := requestGoogleReverseGeocoding(&regeocodingrequest)
	log.Println(results)
	jsonresult, err := json.Marshal(&results)
	if err != nil {
		log.Fatalln("Error marshalling results:\n", err)
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprint(w, string(jsonresult))
}

func requestGoogleReverseGeocoding(r *data.GeocodingRequest) googlemaps.GoogleReverseGeocodingResponse {
	params := googlemaps.FormatParameters(r)
	grequest, err := http.NewRequest("GET", googlemaps.ApiURL+"/geocode/json", nil)
	if err != nil {
		log.Fatalln(err)
	}
	grequest.URL.RawQuery = params.Encode()

	client := http.Client{}
	resp, err := client.Do(grequest)
	if err != nil {
		log.Fatalln("Error in google reverse geocoding:\n", err)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatalln("Error reading the body:\n", err)
	}

	var rgeocodingresult googlemaps.GoogleReverseGeocodingResponse
	err = json.Unmarshal(body, &rgeocodingresult)

	return rgeocodingresult
}
