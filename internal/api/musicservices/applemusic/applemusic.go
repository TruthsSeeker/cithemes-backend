package applemusic

import (
	"io/ioutil"
	"net/http"
	"time"

	"github.com/TruthsSeeker/cithemes-backend/internal/utils"
	"github.com/dgrijalva/jwt-go"
)

var privateKeyPath string = utils.GetEnvVariable("APPLE_MUSIC_PRIVATE_KEY_PATH")

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
		"exp": time.Now().Add(30 * 24 * time.Hour).Unix(),
	}
}