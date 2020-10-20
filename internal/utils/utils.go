package utils

import "log"

// ErrorFatal shorthand to basic error handling
func ErrorFatal(err error) {
	if err != nil {
		log.Fatalln(err)
	}
}
