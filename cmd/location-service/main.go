package main

import (
	"fmt"
	"encoding/json"
	"io/ioutil"
	"github.com/TruthsSeeker/cithemes-location-service/internal/data"
	"github.com/TruthsSeeker/cithemes-location-service/internal/googlemaps"
	"net/http"
	"log"
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
	log.Print(results)
	jsonresult, err := json.Marshal(&results)
	if err != nil {
		log.Fatalln("Error marshalling results:\n", err)
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprint(w, string(jsonresult))
}

func requestGoogleReverseGeocoding(r *data.GeocodingRequest) googlemaps.GoogleReverseGeocodingResponse{
	params := googlemaps.FormatParametersForGoogleRequest(r)
	resp, err := http.Get("https://maps.googleapis.com/maps/api/geocode/json?" + params)
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

func main() {
	http.HandleFunc("/geocoding/reverse", geocodingRequestHandler)
	log.Fatal(http.ListenAndServe(":8000", nil))
}

