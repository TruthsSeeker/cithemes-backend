package cithemesfirestore

import (
	"cloud.google.com/go/firestore"
	"context"
	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
	"log"
)

var client *firestore.Client

func initClient() {
	ctx := context.Background()
	opt := option.WithCredentialsFile("cithemes-firebase-adminsdk-u8pj0-8d56c1f496.json")
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalln(err)
	}

	client, err = app.Firestore(ctx)
	if err != nil {
		log.Fatalln(err)
	}
}

// GetClient returns firestore client and initializes it if needed
func GetClient() *firestore.Client {
	if client == nil {
		initClient()
	}
	return client
}

