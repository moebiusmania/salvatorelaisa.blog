import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";

const { getWeather } = vi.hoisted(() => ({ getWeather: vi.fn() }));

vi.mock("@/utils/now", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/utils/now")>();
	return { ...actual, getWeather };
});

import Weather from "../now/Weather.vue";

describe("now/Weather", () => {
	beforeEach(() => {
		getWeather.mockReset();
	});

	it("shows a loading state before the data resolves", () => {
		getWeather.mockReturnValue(new Promise(() => {}));
		const wrapper = mount(Weather);
		expect(wrapper.text()).toContain("Caricamento");
	});

	it("renders the temperature and condition on success", async () => {
		getWeather.mockResolvedValue({
			city: "Milano",
			temperature: 22,
			emoji: "☀️",
			label: "Sereno",
		});
		const wrapper = mount(Weather);
		await flushPromises();

		const text = wrapper.text();
		expect(text).toContain("22°C");
		expect(text).toContain("Sereno");
		expect(text).toContain("Milano");
	});

	it("renders a fallback when the fetch fails", async () => {
		getWeather.mockRejectedValue(new Error("boom"));
		const wrapper = mount(Weather);
		await flushPromises();

		expect(wrapper.text()).toContain("Meteo non disponibile");
	});
});
