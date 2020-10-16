package cithemesfirestore

import (
	"github.com/TruthsSeeker/cithemes-backend/pkg/types"
)

type City struct {
	LocalizedCountry 	map[string]string 	`firestore:"country" json:"country"`
	LocalizedName 		map[string]string 	`firestore:"localized_name" json:"localized_name"`
	GlobalSongs 		[]SongSnippet 		`firestore:"global_songs" json:"global_songs"`
	LocalSongs 			[]SongSnippet 		`firestore:"local_songs" json:"local_songs"`
	Bounds 				types.Bounds 		`firestore:"bounds" json:"bounds"`
	PlacesID 			string 				`firestore:"places_id" json:"places_id"`
	ImageURL 			string 				`firestore:"image_url" json:"image_url"`
}

type CitySnippet struct {
	LocalizedName 	map[string]string 	`firestore:"localized_name" json:"localized_name"`
	CityID 			string 				`firestore:"city_id" json:"city_id"`
}