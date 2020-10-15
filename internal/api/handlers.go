package api

import (
	"net/http"
	"github.com/TruthsSeeker/cithemes-backend/internal/api/geocoding"
)

var handlers = map[string]http.HandlerFunc {
	"/geocoding/reverse": geocoding.GeocodingRequestHandler,
}

// LoadHandlers loads all the services handlers as defined in the api package
func LoadHandlers(server *http.ServeMux) {
	for handlerPath, handler := range handlers {
		server.HandleFunc(handlerPath, handler)
	}
}
