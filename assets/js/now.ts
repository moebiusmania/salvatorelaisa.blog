// Live data for the "Adesso" (/now) page, fetched client side (no API key
// required). The configuration comes from data/now.yaml and data/weather.yaml
// through js.Build params (see layouts/_partials/head/scripts.html).

import * as params from "@params";

interface WeatherCode {
	from: number;
	to: number;
	emoji: string;
	label: string;
}

interface Params {
	weatherLocation: string;
	githubUser: string;
	weather: { codes: WeatherCode[]; unknown: WeatherIcon };
}

const config = params as unknown as Params;

export const NOW_WEATHER_LOCATION = config.weatherLocation;
export const NOW_GITHUB_USER = config.githubUser;

// --- fetch helper -------------------------------------------------------------

type Query = Record<string, string | number>;

// GET + JSON, throwing on non-2xx responses so callers can fall back to their
// error state.
export const getJSON = async <T>(url: string, query: Query = {}): Promise<T> => {
	const params = new URLSearchParams(
		Object.entries(query).map(([key, value]) => [key, String(value)]),
	);
	const target = params.size > 0 ? `${url}?${params}` : url;
	const response = await fetch(target);

	if (!response.ok) {
		throw new Error(`Request failed (${response.status}): ${target}`);
	}

	return (await response.json()) as T;
};

// --- weather ------------------------------------------------------------------

export type WeatherIcon = { emoji: string; label: string };

// Maps a WMO weather interpretation code to an emoji + Italian label.
export const weatherCodeToIcon = (code: number): WeatherIcon => {
	const match = config.weather.codes.find((c) => code >= c.from && code <= c.to);
	return match
		? { emoji: match.emoji, label: match.label }
		: { ...config.weather.unknown };
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
	const geo = await getJSON<GeocodingResponse>(
		"https://geocoding-api.open-meteo.com/v1/search",
		{ name: location, count: 1, language: "it", format: "json" },
	);

	const place = geo.results?.[0];
	if (!place) {
		throw new Error(`Località non trovata: ${location}`);
	}

	const forecast = await getJSON<ForecastResponse>(
		"https://api.open-meteo.com/v1/forecast",
		{
			latitude: place.latitude,
			longitude: place.longitude,
			current: "temperature_2m,weather_code",
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

// A user's most recently updated public repositories. Unauthenticated requests
// are rate-limited to 60/hour per IP (fine for a blog).
export const getLatestRepos = async (
	user: string,
	count = 3,
): Promise<Repo[]> => {
	const repos = await getJSON<GithubRepo[]>(
		`https://api.github.com/users/${user}/repos`,
		{ sort: "updated", per_page: count },
	);

	return repos.map((repo) => ({
		name: repo.name,
		url: repo.html_url,
		description: repo.description,
		language: repo.language,
		updatedAt: repo.updated_at,
	}));
};
