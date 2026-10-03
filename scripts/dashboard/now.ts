// Loads the data behind the /now page for the dashboard's "Now" modal.

import type { Repo, Weather } from "../../src/utils/now.ts";

type NowModule = typeof import("../../src/utils/now.ts");

export type Live<T> =
	| { status: "loading" }
	| { status: "ok"; value: T }
	| { status: "error" };

export interface NowData {
	work: NowModule["NOW_WORK"];
	weatherLocation: string;
	githubUser: string;
	/** Only the entries the page would render (both label and link set). */
	watching: { type: string; label: string }[];
	event: NowModule["NOW_EVENT"];
	weather: Live<Weather>;
	repos: Live<Repo[]>;
}

/** Fresh import every time, so edits to now.ts show up without a restart. */
const importNow = (): Promise<NowModule> =>
	import(
		`${new URL("../../src/utils/now.ts", import.meta.url).href}?t=${Date.now()}`
	);

/**
 * Resolves the static data right away; the weather and repos are fetched in
 * the background and reported through `onLive` as they land.
 */
export const loadNow = async (
	onLive: (patch: Partial<Pick<NowData, "weather" | "repos">>) => void,
): Promise<NowData> => {
	const now = await importNow();
	const watching = now.NOW_WATCHING as Partial<
		Record<"series" | "movie", { label?: string; imdb?: string }>
	>;

	now.getWeather(now.NOW_WEATHER_LOCATION).then(
		(value) => onLive({ weather: { status: "ok", value } }),
		() => onLive({ weather: { status: "error" } }),
	);
	now.getLatestRepos(now.NOW_GITHUB_USER).then(
		(value) => onLive({ repos: { status: "ok", value } }),
		() => onLive({ repos: { status: "error" } }),
	);

	return {
		work: now.NOW_WORK,
		weatherLocation: now.NOW_WEATHER_LOCATION,
		githubUser: now.NOW_GITHUB_USER,
		watching: [
			{ type: "Series", ...watching.series },
			{ type: "Movie", ...watching.movie },
		].filter((item): item is { type: string; label: string; imdb: string } =>
			!!item.label && !!item.imdb
		),
		event: now.NOW_EVENT,
		weather: { status: "loading" },
		repos: { status: "loading" },
	};
};
