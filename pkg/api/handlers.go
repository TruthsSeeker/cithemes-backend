package api

import(
	"net/http"
)

var handlers = initHandlersMap()

func initHandlersMap() map[string]http.HandlerFunc {
	handlersMap := make(map[string]http.HandlerFunc)
	handlersMap["/geocoding/reverse"] = GeocodingRequestHandler
	return handlersMap
}

func LoadHandlers(server *http.ServeMux) {
	for handlerPath, handler := range handlers {
		server.HandleFunc(handlerPath, handler)
	}
}