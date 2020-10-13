package main

import (
	"net/http"
	"log"
	"github.com/TruthsSeeker/cithemes-location-service/pkg/api"
)


func main() {
	serveMux := http.NewServeMux()
	api.LoadHandlers(serveMux)
	log.Fatal(http.ListenAndServe(":8000", serveMux))
}

