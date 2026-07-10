// Data + config for the "Adesso" (/now) page.
//
// The constants below are editable placeholders: tweak them to reflect what you
// are currently doing. The async helpers fetch live data client-side (no API
// key required) and are unit-tested with `$fetch` stubbed.

// --- editable placeholders ----------------------------------------------------

export const NOW_WORK = {
	company: "Carol Health",
	role: "Engineering Tech Lead",
	city: "Milano",
};

// City queried for the weather widget.
export const NOW_WEATHER_LOCATION = "Milano";

export const NOW_GITHUB_USER = "moebiusmania";

export const NOW_WATCHING = {
	series: { label: "Spider Noir", imdb: "https://www.imdb.com/title/tt30460310/" },
	// movie: { label: "TODO", imdb: "https://www.imdb.com/title/TODO" },
};

export const NOW_EVENT = {
	name: "Festa del Ticino - Pavia",
	url: "https://www.visitpavia.com/en/event/festa-del-ticino-pavia",
	date: "primi di Settembre",
};

// --- weather ------------------------------------------------------------------

export type WeatherIcon = { emoji: string; label: string };

// Maps a WMO weather interpretation code to an emoji + Italian label.
// Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes).
export const weatherCodeToIcon = (code: number): WeatherIcon => {
	if (code === 0) return { emoji: "☀️", label: "Sereno" };
	if (code >= 1 && code <= 3) return { emoji: "⛅", label: "Poco nuvoloso" };
	if (code === 45 || code === 48) return { emoji: "🌫️", label: "Nebbia" };
	if (code >= 51 && code <= 57) return { emoji: "🌦️", label: "Pioviggine" };
	if (code >= 61 && code <= 67) return { emoji: "🌧️", label: "Pioggia" };
	if (code >= 71 && code <= 77) return { emoji: "🌨️", label: "Neve" };
	if (code >= 80 && code <= 82) return { emoji: "🌧️", label: "Rovesci" };
	if (code === 85 || code === 86)
		return { emoji: "🌨️", label: "Rovesci di neve" };
	if (code === 95) return { emoji: "⛈️", label: "Temporale" };
	if (code === 96 || code === 99)
		return { emoji: "⛈️", label: "Temporale con grandine" };
	return { emoji: "❓", label: "Non disponibile" };
};

export type Weather = {
	city: string;
	temperature: number;
	emoji: string;
	label: string;
};

type GeocodingResponse = {
	results?: Array<{ name: string; latitude: number; longitude: number }>;
};

type ForecastResponse = {
	current?: { temperature_2m: number; weather_code: number };
};

// Resolves a city name to its current temperature + weather condition using the
// free Open-Meteo geocoding + forecast APIs (no API key, CORS-friendly).
export const getWeather = async (location: string): Promise<Weather> => {
	const geo = await $fetch<GeocodingResponse>(
		"https://geocoding-api.open-meteo.com/v1/search",
		{ query: { name: location, count: 1, language: "it", format: "json" } },
	);

	const place = geo.results?.[0];
	if (!place) {
		throw new Error(`Località non trovata: ${location}`);
	}

	const forecast = await $fetch<ForecastResponse>(
		"https://api.open-meteo.com/v1/forecast",
		{
			query: {
				latitude: place.latitude,
				longitude: place.longitude,
				current: "temperature_2m,weather_code",
			},
		},
	);

	const current = forecast.current;
	if (!current) {
		throw new Error(`Meteo non disponibile per: ${location}`);
	}

	return {
		city: place.name,
		temperature: Math.round(current.temperature_2m),
		...weatherCodeToIcon(current.weather_code),
	};
};

// --- github -------------------------------------------------------------------

export type Repo = {
	name: string;
	url: string;
	description: string | null;
	language: string | null;
	updatedAt: string;
};

type GithubRepo = {
	name: string;
	html_url: string;
	description: string | null;
	language: string | null;
	updated_at: string;
};

// Fetches a user's most recently updated public repositories via the GitHub API.
// Unauthenticated requests are rate-limited to 60/hour per IP (fine for a blog).
export const getLatestRepos = async (
	user: string,
	count = 3,
): Promise<Repo[]> => {
	const repos = await $fetch<GithubRepo[]>(
		`https://api.github.com/users/${user}/repos`,
		{ query: { sort: "updated", per_page: count } },
	);

	return repos.map((repo) => ({
		name: repo.name,
		url: repo.html_url,
		description: repo.description,
		language: repo.language,
		updatedAt: repo.updated_at,
	}));
};
