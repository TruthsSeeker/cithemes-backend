package cithemesfirestore

import (
	"google.golang.org/api/iterator"
	"math/rand"
	"fmt"
	"strconv"
	"cloud.google.com/go/firestore"
	"context"
)

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