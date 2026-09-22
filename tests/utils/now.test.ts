import { afterEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { type Stub, stub } from "@std/testing/mock";
import {
	getLatestRepos,
	getWeather,
	weatherCodeToIcon,
} from "../../src/utils/now.ts";

// Queues JSON responses for the next `fetch` calls and records the requested URLs.
let fetchStub: Stub<typeof globalThis, Parameters<typeof fetch>, Promise<Response>> | undefined;
const mockFetch = (...bodies: unknown[]): string[] => {
	const urls: string[] = [];
	const queue = [...bodies];
	fetchStub = stub(globalThis, "fetch", (input) => {
		urls.push(String(input));
		return Promise.resolve(Response.json(queue.shift()));
	});
	return urls;
};

afterEach(() => {
	fetchStub?.restore();
	fetchStub = undefined;
});

describe("weatherCodeToIcon", () => {
	it("maps representative WMO codes to the expected Italian labels", () => {
		expect(weatherCodeToIcon(0).label).toBe("Sereno");
		expect(weatherCodeToIcon(2).label).toBe("Poco nuvoloso");
		expect(weatherCodeToIcon(45).label).toBe("Nebbia");
		expect(weatherCodeToIcon(55).label).toBe("Pioviggine");
		expect(weatherCodeToIcon(63).label).toBe("Pioggia");
		expect(weatherCodeToIcon(73).label).toBe("Neve");
		expect(weatherCodeToIcon(81).label).toBe("Rovesci");
		expect(weatherCodeToIcon(86).label).toBe("Rovesci di neve");
		expect(weatherCodeToIcon(95).label).toBe("Temporale");
		expect(weatherCodeToIcon(99).label).toBe("Temporale con grandine");
	});

	it("returns each mapping with a non-empty emoji", () => {
		expect(weatherCodeToIcon(0).emoji).not.toBe("");
	});

	it("falls back to a default for unknown codes", () => {
		const unknown = weatherCodeToIcon(1234);
		expect(unknown.emoji).toBe("❓");
		expect(unknown.label).toBe("Non disponibile");
	});
});

describe("getWeather", () => {
	it("resolves a city to its rounded temperature and condition", async () => {
		const urls = mockFetch(
			{ results: [{ name: "Milano", latitude: 45.46, longitude: 9.18 }] },
			{ current: { temperature_2m: 21.6, weather_code: 0 } },
		);

		const weather = await getWeather("Milano");

		expect(weather).toEqual({
			city: "Milano",
			temperature: 22,
			emoji: "☀️",
			label: "Sereno",
		});
		expect(urls).toHaveLength(2);
	});

	it("throws when the location cannot be geocoded", async () => {
		const urls = mockFetch({ results: [] });

		await expect(getWeather("Nowhere")).rejects.toThrow("Località non trovata");
		expect(urls).toHaveLength(1);
	});
});

describe("getLatestRepos", () => {
	it("maps the GitHub API response and honors the count", async () => {
		const urls = mockFetch([
			{
				name: "repo-one",
				html_url: "https://github.com/user/repo-one",
				description: "First repo",
				language: "TypeScript",
				updated_at: "2026-06-01T00:00:00Z",
			},
		]);

		const repos = await getLatestRepos("user", 3);

		expect(repos).toEqual([
			{
				name: "repo-one",
				url: "https://github.com/user/repo-one",
				description: "First repo",
				language: "TypeScript",
				updatedAt: "2026-06-01T00:00:00Z",
			},
		]);
		expect(urls).toEqual([
			"https://api.github.com/users/user/repos?sort=updated&per_page=3",
		]);
	});
});
