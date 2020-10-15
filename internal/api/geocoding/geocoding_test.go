package geocoding

import (
	"github.com/TruthsSeeker/cithemes-backend/pkg/types"
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"reflect"
	"testing"

	"github.com/TruthsSeeker/cithemes-backend/internal/googlemaps"
)

var ts *httptest.Server

func TestMain(m *testing.M) {
	setup()
	code := m.Run()
	shutdown()
	os.Exit(code)
}

func setup() {
	
	pwd, _ := os.Getwd()
	jsonResponse, err := ioutil.ReadFile(pwd + "/testdata/mockreversegeocodingraw.json")
	if err != nil {
		log.Fatalln(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write(jsonResponse)
	}))
	googlemaps.ApiURL = ts.URL
}

func shutdown() {

}

func Test_geocodingRequestHandler(t *testing.T) {
	type args struct {
		w *httptest.ResponseRecorder
		r *http.Request
	}
	tests := []struct {
		name     string
		expected []byte
		args     args
	}{
		{
			name: "default",
			expected: func() []byte {
				pwd, _ := os.Getwd()
				jsonResponse, err := ioutil.ReadFile(pwd + "/testdata/mockreversegeocodingtransformed.json")
				if err != nil {
					log.Fatalln(err)
				}
				return jsonResponse
			}(),
			args: args{
				w: httptest.NewRecorder(),
				r: func() *http.Request {
					mockRequest, err := json.Marshal(types.GeocodingRequest{
						Position: types.Coordinates{
							Latitude:  40.714224,
							Longitude: -73.961452,
						},
						Locale: "FR",
					})
					if err != nil {
						log.Fatalln(err)
					}
					req := httptest.NewRequest("GET", "/geocoding/reverse", bytes.NewBuffer(mockRequest))

					return req
				}(),
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			geocodingRequestHandler(tt.args.w, tt.args.r)
			var unmarshalled googlemaps.GoogleReverseGeocodingResponse
			err := json.Unmarshal(tt.args.w.Body.Bytes(), &unmarshalled)
			if err != nil {
				log.Fatalln(err)
			}
			var expected googlemaps.GoogleReverseGeocodingResponse
			err = json.Unmarshal(tt.expected, &expected)
			if err != nil {
				log.Fatalln(err)
			}
			if !reflect.DeepEqual(unmarshalled, expected) {
				t.Errorf("handler returned unexpected body")
			}
		})
	}
}

func Test_requestGoogleReverseGeocoding(t *testing.T) {
	type args struct {
		r *types.GeocodingRequest
	}
	tests := []struct {
		name string
		args args
		want googlemaps.GoogleReverseGeocodingResponse
	}{
		{
			name: "default",
			args: args{
				r: &types.GeocodingRequest{
					Position: types.Coordinates{
						Latitude:  40.714224,
						Longitude: -73.961452,
					},
					Locale: "FR",
				},
			},
			want: func() googlemaps.GoogleReverseGeocodingResponse {
				pwd, _ := os.Getwd()
				jsonResponse, err := ioutil.ReadFile(pwd + "/testdata/mockreversegeocodingraw.json")
				if err != nil {
					log.Fatalln(err)
				}
				var gResponse googlemaps.GoogleReverseGeocodingResponse
				json.Unmarshal(jsonResponse, &gResponse)
				return gResponse
			}(),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := requestGoogleReverseGeocoding(tt.args.r); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("requestGoogleReverseGeocoding() = %v,\n\n want %v", got, tt.want)
			}
		})
	}
}
