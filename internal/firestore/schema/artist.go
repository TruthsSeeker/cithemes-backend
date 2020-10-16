package cithemesfirestore

type Artist struct {
	Name 		string 			`firestore:"name" json:"name"`
	City 		CitySnippet 	`firestore:"city" json:"city"`
	Songs 		[]SongSnippet 	`firestore:"songs" json:"songs"`
	ProfileURL 	string 			`firestore:"profile_url" json:"profile_url"`
	BannerURL 	string 			`firestore:"banner_url" json:"banner_url"`
}

type ArtistSnippet struct {
	Name 		string 		`firestore:"name" json:"name"`
	City 		CitySnippet `firestore:"city" json:"city"`
	ArtistID 	string 		`firestore:"id" json:"id"`
}