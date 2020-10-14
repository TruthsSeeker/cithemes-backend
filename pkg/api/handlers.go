package api

import (
	"net/http"
)

var handlers = map[string]http.HandlerFunc {
	"/geocoding/reverse": geocodingRequestHandler,
}

// LoadHandlers loads all the services handlers as defined in the api package
func LoadHandlers(server *http.ServeMux) {
	for handlerPath, handler := range handlers {
		server.HandleFunc(handlerPath, handler)
	}
}
