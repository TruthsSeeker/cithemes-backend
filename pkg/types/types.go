package types

import (
	"google.golang.org/genproto/googleapis/type/latlng"
)

// Coordinates wrapper struct for a set of coordinates
type Coordinates struct {
	Latitude float64 `json:"lat"`
	Longitude float64 `json:"lng"`
}

type Bounds struct {
	Northeast Coordinates `json:"ne"`
	Southwest Coordinates `json:"sw"`
}

func (c *Coordinates) toGeoPoint() latlng.LatLng {
	return latlng.LatLng{
		Latitude: c.Latitude,
		Longitude: c.Longitude,
	}
}

func (b *Bounds) toFirestore() map[string]latlng.LatLng {
	return map[string]latlng.LatLng{
		"northeast": b.Northeast.toGeoPoint(),
		"nouthwest": b.Southwest.toGeoPoint(),
	}
}