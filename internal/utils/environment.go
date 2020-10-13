package utils

import (
	"log"
	"os"
	"github.com/joho/godotenv"
)

// GetEnvVariable Returns variable corresponding to key from .env file
func GetEnvVariable(key string) string {
	err := godotenv.Load("../../.env")
	if err != nil {
		log.Fatal("Error loading .env file:\n", err)
	}

	return os.Getenv(key)
}