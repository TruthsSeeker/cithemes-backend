package api

import(
	"net/http"
)

var handlers = initHandlersMap()

func initHandlersMap() map[string]http.HandlerFunc {
	handlersMap := make(map[string]http.HandlerFunc)

	handlersMap["/geocoding/reverse"] = geocodingRequestHandler
	
	return handlersMap
}


// LoadHandlers loads all the services handlers as defined in the api package
func LoadHandlers(server *http.ServeMux) {
	for handlerPath, handler := range handlers {
		server.HandleFunc(handlerPath, handler)
	}
}