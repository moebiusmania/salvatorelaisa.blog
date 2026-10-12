package now

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestRepoData(t *testing.T) {
	d, codes, err := Load("../..")
	if err != nil {
		t.Fatal(err)
	}
	if d.WeatherLocation == "" || d.GithubUser == "" || d.Work.Role == "" {
		t.Errorf("incomplete data/now.yaml: %+v", d)
	}
	// Same expectations as the old src/utils/now.ts tests.
	cases := map[int]string{
		0: "Sereno", 2: "Poco nuvoloso", 45: "Nebbia", 55: "Pioviggine", 63: "Pioggia",
		73: "Neve", 81: "Rovesci", 86: "Rovesci di neve", 95: "Temporale", 99: "Temporale con grandine",
		42: "Non disponibile",
	}
	for code, want := range cases {
		if got := codes.Icon(code); got.Label != want || got.Emoji == "" {
			t.Errorf("Icon(%d) = %+v, want %s", code, got, want)
		}
	}
	if codes.Icon(1000).Emoji != "❓" {
		t.Error("unknown code emoji")
	}
}

func TestWatched(t *testing.T) {
	var d Data
	d.Watching.Series = &Entry{Label: "Show", IMDB: "https://imdb"}
	d.Watching.Movie = &Entry{Label: "No link"}
	if got := d.Watched(); len(got) != 1 || got[0] != (Watched{"Series", "Show"}) {
		t.Errorf("Watched = %+v", got)
	}
}

func TestClient(t *testing.T) {
	var calls []string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls = append(calls, r.URL.String())
		switch r.URL.Path {
		case "/geo":
			if r.URL.Query().Get("name") == "Nowhere" {
				io.WriteString(w, `{}`)
				return
			}
			io.WriteString(w, `{"results":[{"name":"Milano","latitude":45.46,"longitude":9.19}]}`)
		case "/forecast":
			io.WriteString(w, `{"current":{"temperature_2m":21.6,"weather_code":63}}`)
		case "/users/user/repos":
			io.WriteString(w, `[{"name":"blog","html_url":"https://github.com/user/blog","description":null,"language":"Go","updated_at":"2026-10-01"}]`)
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()
	c := Client{HTTP: server.Client(), GeocodingURL: server.URL + "/geo", ForecastURL: server.URL + "/forecast", GithubURL: server.URL}
	_, codes, _ := Load("../..")

	w, err := c.Weather(context.Background(), "Milano", codes)
	if err != nil {
		t.Fatal(err)
	}
	if w.Temperature != 22 || w.City != "Milano" || w.Label != "Pioggia" || len(calls) != 2 {
		t.Errorf("weather = %+v after %d calls", w, len(calls))
	}

	calls = nil
	if _, err := c.Weather(context.Background(), "Nowhere", codes); err == nil || !strings.Contains(err.Error(), "Località non trovata") || len(calls) != 1 {
		t.Errorf("missing place: %v after %d calls", err, len(calls))
	}

	calls = nil
	repos, err := c.Repos(context.Background(), "user", 3)
	if err != nil {
		t.Fatal(err)
	}
	if len(repos) != 1 || repos[0].URL != "https://github.com/user/blog" || calls[0] != "/users/user/repos?sort=updated&per_page=3" {
		t.Errorf("repos = %+v via %v", repos, calls)
	}
}
