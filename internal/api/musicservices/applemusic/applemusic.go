package applemusic

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"
	"time"

	"github.com/TruthsSeeker/cithemes-backend/internal/utils"
	"github.com/dgrijalva/jwt-go"
)

var privateKeyPath string = utils.GetEnvVariable("APPLE_MUSIC_PRIVATE_KEY_PATH")
var apiURL string = "https://api.music.apple.com"

func setAuthHeader(r *http.Request) {
	r.Header.Set("Authorization", "Bearer " + GetJWT())
}

func GetJWT() string {
	file, err := ioutil.ReadFile(privateKeyPath)
	utils.ErrorFatal(err)

	key, err := jwt.ParseECPrivateKeyFromPEM(file)
	utils.ErrorFatal(err)

	token := jwt.NewWithClaims(jwt.SigningMethodES256, getJWTClaims())
	token.Header["kid"] = utils.GetEnvVariable("APPLE_MUSIC_PRIVATE_KEY_ID")

	signedString, err := token.SignedString(key)
	utils.ErrorFatal(err)

	return signedString
}

func getJWTClaims() jwt.MapClaims{
	return jwt.MapClaims{
		"iss": utils.GetEnvVariable("APPLE_TEAM_ID"),
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(1 * time.Hour).Unix(),
	}
}

func Search(query string, locale string) (*GetSongsRequest, error) {
	token := GetJWT()
	formattedQuery := strings.ReplaceAll(query, " ", "+")
	request, err := http.NewRequest("GET", apiURL + "/v1/catalog/" + strings.ToLower(locale) + "/search", nil)
	utils.ErrorFatal(err)
	request.Header.Set("Authorization", "Bearer " + token)

	request.URL.Query().Set("term", formattedQuery)
	request.URL.Query().Set("limit", "20")
	request.URL.Query().Set("types", "songs")
	request.URL.Query().Encode()

	client:= http.Client{}
	resp, err := client.Do(request)
	utils.ErrorFatal(err)

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var unmarshalledResponse GetSongsRequest
	err = json.Unmarshal(body, &unmarshalledResponse)
	if err != nil {
		return nil, err
	}

	return &unmarshalledResponse, nil 
}