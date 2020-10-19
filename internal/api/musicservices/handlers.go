package musicservices

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/TruthsSeeker/cithemes-backend/internal/api/musicservices/spotify"
	"github.com/TruthsSeeker/cithemes-backend/internal/utils"
)

var Handlers = map[string]http.HandlerFunc{
	"/music/track/spotify": GetSpotifyTrack,
}

func GetSpotifyTrack(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	jsonBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatalln("Error reading body: ", err)
	}

	var jsonRequest map[string]interface{}
	err = json.Unmarshal(jsonBody, &jsonRequest)
	if err != nil {
		log.Fatalln("Error unmarshalling body: ", err)
	}

	sResponse := spotify.GetTrack(jsonRequest["id"].(string))
	// responseMap := map[string]string{}
	// responseMap["title"] = sResponse.Name
	// responseMap["artist"] = sResponse.Artists[0].Name
	// responseMap["album"] = sResponse.Album.Name

	respMarshalled, err := json.Marshal(sResponse)
	utils.ErrorFatal(err)

	w.Write(respMarshalled)
}
