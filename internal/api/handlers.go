package api

import (
	"github.com/TruthsSeeker/cithemes-backend/internal/api/musicservices"
	"net/http"
	"github.com/TruthsSeeker/cithemes-backend/internal/api/geocoding"
)

var handlers = map[string]http.HandlerFunc {
	"/geocoding/reverse": geocoding.GeocodingRequestHandler,
}

func init() {
	addHandlers(musicservices.Handlers)
}

func addHandlers(m map[string]http.HandlerFunc) {
	for hk, hv := range m {
		handlers[hk] = hv
	}
}

// LoadHandlers loads all the services handlers as defined in the api package
func LoadHandlers(server *http.ServeMux) {
	for handlerPath, handler := range handlers {
		server.HandleFunc(handlerPath, handler)
	}
}
