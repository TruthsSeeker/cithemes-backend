package musicservices

import (
	"encoding/json"
	"io/ioutil"
	"strings"
	"net/url"
	"github.com/TruthsSeeker/cithemes-backend/internal/utils"
	"net/http"
	b64 "encoding/base64"
)

type spotifyClientAuthResponse struct {
	Token string `json:"access_token"`
	Expires int `json:"expires_in"`
	TokenType string `json:"token_type"`
}

var accessToken string
var spotifyAPIURL string = "https://accounts.spotify.com/api"


func requestAccessToken() (error) {
	data := url.Values{}
	data.Set("grant_type", "client_credentials")

	authRequest, err := http.NewRequest("POST", spotifyAPIURL+"/token", strings.NewReader(data.Encode()))
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

	var unmarshalledResponse spotifyClientAuthResponse
	err = json.Unmarshal(body, &unmarshalledResponse)
	if err != nil {
		return err
	}

	accessToken = unmarshalledResponse.Token
	return nil
}

func getAuthorizationHeader() string{
	clientID := utils.GetEnvVariable("SPOTIFY_CLIENT_ID")
	clientSecret := utils.GetEnvVariable("SPOTIFY_CLIENT_SECRET")
	encoded := b64.StdEncoding.EncodeToString([]byte(clientID + ":" + clientSecret))
	return "Basic " + encoded
}

func getTrack(trackID string){}