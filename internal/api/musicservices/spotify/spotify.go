package spotify

import (
	"bytes"
	b64 "encoding/base64"
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strings"

	"github.com/TruthsSeeker/cithemes-backend/internal/utils"
)

var accessToken string
var spotifyAPIURL string = "https://api.spotify.com"
var spotifyAuthURL string = "https://accounts.spotify.com/api"

func requestAccessToken() error {
	data := url.Values{}
	data.Set("grant_type", "client_credentials")

	authRequest, err := http.NewRequest("POST", spotifyAuthURL+"/token", strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}
	authHeader := getAuthorizationHeader()
	authRequest.Header.Add("Authorization", authHeader)
	authRequest.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := http.Client{}
	resp, err := client.Do(authRequest)
	if err != nil {
		return err
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var unmarshalledResponse ClientAuthResponse
	err = json.Unmarshal(body, &unmarshalledResponse)
	if err != nil {
		return err
	}

	accessToken = unmarshalledResponse.Token
	return nil
}

func getAuthorizationHeader() string {
	clientID := utils.GetEnvVariable("SPOTIFY_CLIENT_ID")
	clientSecret := utils.GetEnvVariable("SPOTIFY_CLIENT_SECRET")
	encoded := b64.StdEncoding.EncodeToString([]byte(clientID + ":" + clientSecret))
	return "Basic " + encoded
}

func setAccessTokenHeader(r *http.Request) {
	// r.Header.Add("Authorisation", "Bearer " + accessToken)
	log.Println(accessToken)
	r.Header.Set("Authorization", "Bearer " + accessToken)
}

func requestWithRetry(r *http.Request, retryCount int) (*http.Response, error) {
	client := &http.Client{}
	setAccessTokenHeader(r)
	response, err := client.Do(r)
	if err != nil {
		return nil, err
	}
	if response.StatusCode >= 400 {
		err = requestAccessToken()
		if err != nil {
			log.Fatalln("error requesting accessToken: ", err)
		}
	}
	if response.StatusCode == 200 {
		return response, nil
	}
	defer response.Body.Close()
	body, err := ioutil.ReadAll(response.Body)
	log.Println(string(body))
	if retryCount < 5 {
		response, err = requestWithRetry(r, retryCount+1)
	} else { 
		return nil, errors.New("Retry count exceeded")
	}
	return response, err
}

func GetTrack(trackID string) *Track {
	request, err := http.NewRequest("GET", spotifyAPIURL+"/v1/tracks/"+trackID, bytes.NewBuffer(nil))
	if err != nil {
		log.Fatalln(err)
	}
	request.Header.Set("Accept", "application/json")
	request.Header.Set("Content-Type", "application/json")

	response, err := requestWithRetry(request, 0)
	if err != nil {
		log.Fatalln(err)
	}

	defer response.Body.Close()
	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		log.Fatalln(err)
	}

	var track Track
	err = json.Unmarshal(body, &track)
	if err != nil {
		log.Fatalln(err)
	}
	return &track
}
