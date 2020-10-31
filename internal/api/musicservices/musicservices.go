package musicservices

import (
	"sync"

	"github.com/TruthsSeeker/cithemes-backend/internal/cithemesfirestore"
)

func MultiSearch(term string) []cithemesfirestore.Song {
	var wg sync.WaitGroup
	wg.Add(2)
	c := make(chan []cithemesfirestore.Song, 2)

	go func() {
		wg.Wait()
		close(c)
	}
	go searchAppleMusic(term, c, wg)
	go searchSpotify(term, c, wg)

	var results [][]cithemesfirestore.Song
	for i := range c {
		results = append(results, <-c)
	}

	return mergeResults(results)
}

func searchSpotify(term string, c chan<- []cithemesfirestore.Song, wg *sync.WaitGroup) {
	defer wg.Done()

}

func searchAppleMusic(term string, c chan<- []cithemesfirestore.Song, wg *sync.WaitGroup) {
	defer wg.Done()

}

func mergeResults(results [][]cithemesfirestore.Song) []cithemesfirestore.Song {
	return nil
}