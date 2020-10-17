package cithemesfirestore

type User struct {
	Name string `firestore:"name" json:"name"`
	Email string `firestore:"email" json:"email"`
	IsArtist bool `firestore:"is_artist" json:"is_artist"`
	ArtistID string `firestore:"artist_id" json:"artist_id"`
	HomeCity string `firestore:"home_city" json:"home_city"`
	ProfileURL string `firestore:"profile_url" json:"profile_url"`
	SongsVoted []string `firestore:"songs_voted" json:"songs_voted"`
}