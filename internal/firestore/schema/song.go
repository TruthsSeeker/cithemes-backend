package firestore

type Song struct {
	ID 					string 				`firestore:"id" json:"id"`
	CityID 				string 				`firestore:"city" json:"city"`
	Title 				string 				`firestore:"title" json:"title"`
	Artist 				ArtistSnippet 		`firestore:"artist" json:"artist"`
	Duration 			int64 				`firestore:"duration" json:"duration"`
	VoteTotal 			int64 				`firestore:"score" json:"score"`
	MusicServiceIDs 	map[string]string 	`firestore:"music_service_ids" json:"music_service_ids"`
	PreviewURL 			string 				`firestore:"preview_url" json:"preview_url"`
	CoverURL 			string 				`firestore:"cover_url" json:"cover_url"`
	OP 					map[string]string 	`firestore:"op" json:"op"`
}

// SongSnippet snippet of the top 100(?) songs for the city
// used to minimize document reads
type SongSnippet struct {
	SongID 		string 	`firestore:"song_id" json:"song_id"`
	Title 		string 	`firestore:"title" json:"title"`
	Artist 		string 	`firestore:"artist" json:"artist"`
	VoteTotal 	int64 	`firestore:"score" json:"score"`
	// UpdatedAt allows for on device check of whether an user's vote is already reflected in VoteTotal
	UpdatedAt 	int64 	`firestore:"updated_at" json:"updated_at"`
}

