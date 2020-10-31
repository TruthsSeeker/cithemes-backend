package cithemesfirestore

import (
	"github.com/TruthsSeeker/cithemes-backend/pkg/types"
	"google.golang.org/api/iterator"
	"math/rand"
	"fmt"
	"strconv"
	"cloud.google.com/go/firestore"
	"context"
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

type User struct {
	Name string `firestore:"name" json:"name"`
	Email string `firestore:"email" json:"email"`
	IsArtist bool `firestore:"is_artist" json:"is_artist"`
	ArtistID string `firestore:"artist_id" json:"artist_id"`
	HomeCity string `firestore:"home_city" json:"home_city"`
	ProfileURL string `firestore:"profile_url" json:"profile_url"`
	SongsVoted []string `firestore:"songs_voted" json:"songs_voted"`
}

type Vote struct {
	Value int `firestore:"value" json:"value"`
	SongID string `firestore:"song_id" json:"song_id"`
}

type VoteCounter struct {
	NumShards int
}

type Shard struct {
	Count int
}


func (c *VoteCounter) InitCounter(ctx context.Context, docRef *firestore.DocumentRef) error {
	colRef := docRef.Collection("shards")

	for num := 0; num < c.NumShards; num++ {
		shard := Shard{0}
		if _, err := colRef.Doc(strconv.Itoa(num)).Set(ctx, shard); err != nil {
			return fmt.Errorf("Set: %v", err)
		}
	}
	return nil
}

func (c *VoteCounter) IncrementCounter(ctx context.Context, docRef *firestore.DocumentRef, value int) (*firestore.WriteResult, error) {
	docID := strconv.Itoa(rand.Intn(c.NumShards))
	shardRef := docRef.Collection("shards").Doc(docID)

	return shardRef.Update(ctx, []firestore.Update{
		{Path: "Count", Value: firestore.Increment(value)},
	})
}

func (c *VoteCounter) GetCount(ctx context.Context, docRef *firestore.DocumentRef) (int64, error) {
	var total int64
	shards := docRef.Collection("shards").Documents(ctx) // returns an iterator
	for {
		doc, err := shards.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return 0, fmt.Errorf("Next: %v", err)
		}

		vTotal := doc.Data()["Count"]
		shardCount, ok := vTotal.(int64) // type assertion
		if !ok {
			return 0, fmt.Errorf("Invalid data type %v, expected int64", vTotal)
		}
		total += shardCount
	}
	return total, nil
}