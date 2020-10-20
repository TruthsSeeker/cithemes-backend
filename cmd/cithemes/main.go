package main

import (
	"log"
	"net/http"

	"github.com/TruthsSeeker/cithemes-backend/internal/api"
)


func main() {
	serveMux := http.NewServeMux()
	api.LoadHandlers(serveMux)
	log.Fatal(http.ListenAndServe(":8000", serveMux))
}

