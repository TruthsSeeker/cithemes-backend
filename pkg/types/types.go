package types

// Coordinates wrapper struct for a set of coordinates
type Coordinates struct {
	Latitude float64 `firestore:"lat" json:"lat"`
	Longitude float64 `firestore:"lng" json:"lng"`
}

type Bounds struct {
	Northeast Coordinates `firestore:"ne" json:"ne"`
	Southwest Coordinates `firestore:"sw" json:"sw"`
}