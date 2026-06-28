import { describe, it, expect, afterEach, vi } from "vitest";
import {
	weatherCodeToIcon,
	getWeather,
	getLatestRepos,
} from "../now";

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
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("resolves a city to its rounded temperature and condition", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				results: [{ name: "Milano", latitude: 45.46, longitude: 9.18 }],
			})
			.mockResolvedValueOnce({
				current: { temperature_2m: 21.6, weather_code: 0 },
			});
		vi.stubGlobal("$fetch", fetchMock);

		const weather = await getWeather("Milano");

		expect(weather).toEqual({
			city: "Milano",
			temperature: 22,
			emoji: "☀️",
			label: "Sereno",
		});
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("throws when the location cannot be geocoded", async () => {
		const fetchMock = vi.fn().mockResolvedValueOnce({ results: [] });
		vi.stubGlobal("$fetch", fetchMock);

		await expect(getWeather("Nowhere")).rejects.toThrow("Località non trovata");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});

describe("getLatestRepos", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("maps the GitHub API response and honors the count", async () => {
		const fetchMock = vi.fn().mockResolvedValueOnce([
			{
				name: "repo-one",
				html_url: "https://github.com/user/repo-one",
				description: "First repo",
				language: "TypeScript",
				updated_at: "2026-06-01T00:00:00Z",
			},
		]);
		vi.stubGlobal("$fetch", fetchMock);

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
		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.github.com/users/user/repos",
			{ query: { sort: "updated", per_page: 3 } },
		);
	});
});
