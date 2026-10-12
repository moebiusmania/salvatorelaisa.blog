// Package now loads the data behind the /now page (data/now.yaml,
// data/weather.yaml) and fetches its live parts (weather, GitHub repos), for
// the dashboard's Now panel. The site fetches the same data client side.
package now

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"os"
	"path/filepath"

	"go.yaml.in/yaml/v3"
)

// Entry is a watched series or movie.
type Entry struct {
	Label string `yaml:"label"`
	IMDB  string `yaml:"imdb"`
}

// Data is data/now.yaml.
type Data struct {
	Work struct {
		Company string `yaml:"company"`
		Role    string `yaml:"role"`
		City    string `yaml:"city"`
	} `yaml:"work"`
	WeatherLocation string `yaml:"weatherLocation"`
	GithubUser      string `yaml:"githubUser"`
	Watching        struct {
		Series *Entry `yaml:"series"`
		Movie  *Entry `yaml:"movie"`
	} `yaml:"watching"`
	Event struct {
		Name string `yaml:"name"`
		URL  string `yaml:"url"`
		Date string `yaml:"date"`
	} `yaml:"event"`
}

// Watched is a watching entry the page would render (label and link set).
type Watched struct{ Type, Label string }

// Watched lists the entries the /now page shows.
func (d Data) Watched() []Watched {
	var out []Watched
	for _, w := range []struct {
		kind  string
		entry *Entry
	}{{"Series", d.Watching.Series}, {"Movie", d.Watching.Movie}} {
		if w.entry != nil && w.entry.Label != "" && w.entry.IMDB != "" {
			out = append(out, Watched{w.kind, w.entry.Label})
		}
	}
	return out
}

// Icon is a weather condition.
type Icon struct {
	Emoji string `yaml:"emoji"`
	Label string `yaml:"label"`
}

// Codes is data/weather.yaml: WMO weather codes to emoji + Italian label.
type Codes struct {
	Codes []struct {
		From  int    `yaml:"from"`
		To    int    `yaml:"to"`
		Emoji string `yaml:"emoji"`
		Label string `yaml:"label"`
	} `yaml:"codes"`
	Unknown Icon `yaml:"unknown"`
}

// Icon maps a WMO code.
func (c Codes) Icon(code int) Icon {
	for _, r := range c.Codes {
		if code >= r.From && code <= r.To {
			return Icon{r.Emoji, r.Label}
		}
	}
	return c.Unknown
}

// Load reads data/now.yaml and data/weather.yaml under root.
func Load(root string) (Data, Codes, error) {
	var d Data
	var c Codes
	if err := readYAML(filepath.Join(root, "data", "now.yaml"), &d); err != nil {
		return d, c, err
	}
	err := readYAML(filepath.Join(root, "data", "weather.yaml"), &c)
	return d, c, err
}

func readYAML(file string, v any) error {
	raw, err := os.ReadFile(file)
	if err != nil {
		return err
	}
	if err := yaml.Unmarshal(raw, v); err != nil {
		return fmt.Errorf("%s: %w", file, err)
	}
	return nil
}

// Client fetches the live data. The URLs are overridable for tests.
type Client struct {
	HTTP         *http.Client
	GeocodingURL string // https://geocoding-api.open-meteo.com/v1/search
	ForecastURL  string // https://api.open-meteo.com/v1/forecast
	GithubURL    string // https://api.github.com
}

// NewClient talks to the real APIs.
func NewClient(h *http.Client) Client {
	return Client{
		HTTP:         h,
		GeocodingURL: "https://geocoding-api.open-meteo.com/v1/search",
		ForecastURL:  "https://api.open-meteo.com/v1/forecast",
		GithubURL:    "https://api.github.com",
	}
}

// Weather is the current weather in a city.
type Weather struct {
	City        string
	Temperature int
	Icon
}

// Weather resolves a city with the Open-Meteo geocoding API, then fetches its
// current temperature and condition (no API key needed).
func (c Client) Weather(ctx context.Context, location string, codes Codes) (Weather, error) {
	var geo struct {
		Results []struct {
			Name      string  `json:"name"`
			Latitude  float64 `json:"latitude"`
			Longitude float64 `json:"longitude"`
		} `json:"results"`
	}
	q := url.Values{"name": {location}, "count": {"1"}, "language": {"it"}, "format": {"json"}}
	if err := c.getJSON(ctx, c.GeocodingURL+"?"+q.Encode(), &geo); err != nil {
		return Weather{}, err
	}
	if len(geo.Results) == 0 {
		return Weather{}, fmt.Errorf("Località non trovata: %s", location)
	}
	place := geo.Results[0]

	var forecast struct {
		Current *struct {
			Temperature float64 `json:"temperature_2m"`
			Code        int     `json:"weather_code"`
		} `json:"current"`
	}
	q = url.Values{
		"latitude":  {fmt.Sprint(place.Latitude)},
		"longitude": {fmt.Sprint(place.Longitude)},
		"current":   {"temperature_2m,weather_code"},
	}
	if err := c.getJSON(ctx, c.ForecastURL+"?"+q.Encode(), &forecast); err != nil {
		return Weather{}, err
	}
	if forecast.Current == nil {
		return Weather{}, fmt.Errorf("Meteo non disponibile per: %s", location)
	}
	return Weather{
		City:        place.Name,
		Temperature: int(math.Floor(forecast.Current.Temperature + 0.5)),
		Icon:        codes.Icon(forecast.Current.Code),
	}, nil
}

// Repo is a public GitHub repository.
type Repo struct {
	Name        string `json:"name"`
	URL         string `json:"html_url"`
	Description string `json:"description"`
	Language    string `json:"language"`
	UpdatedAt   string `json:"updated_at"`
}

// Repos fetches a user's most recently updated public repositories
// (unauthenticated: 60 requests/hour per IP).
func (c Client) Repos(ctx context.Context, user string, count int) ([]Repo, error) {
	var repos []Repo
	u := fmt.Sprintf("%s/users/%s/repos?sort=updated&per_page=%d", c.GithubURL, url.PathEscape(user), count)
	return repos, c.getJSON(ctx, u, &repos)
}

func (c Client) getJSON(ctx context.Context, u string, v any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return err
	}
	res, err := c.HTTP.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode > 299 {
		return fmt.Errorf("request failed (%d): %s", res.StatusCode, u)
	}
	return json.NewDecoder(res.Body).Decode(v)
}
