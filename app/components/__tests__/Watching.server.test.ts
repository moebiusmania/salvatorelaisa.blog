import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

const { watching } = vi.hoisted(() => ({
	watching: {
		series: { label: "A Series", imdb: "https://www.imdb.com/title/series" },
		movie: { label: "A Movie", imdb: "https://www.imdb.com/title/movie" },
	} as {
		series?: { label: string; imdb: string };
		movie?: { label: string; imdb: string };
	},
}));

vi.mock("@/utils/now", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/utils/now")>();
	return {
		...actual,
		get NOW_WATCHING() {
			return watching;
		},
	};
});

import Watching from "../now/Watching.server.vue";

const stubs = {
	NuxtLink: {
		template: '<a :href="href"><slot /></a>',
		props: ["href"],
	},
	IconsExternal: true,
};

describe("now/Watching", () => {
	it("renders correctly", () => {
		watching.series = {
			label: "A Series",
			imdb: "https://www.imdb.com/title/series",
		};
		watching.movie = {
			label: "A Movie",
			imdb: "https://www.imdb.com/title/movie",
		};
		const wrapper = mount(Watching, { global: { stubs } });
		expect(wrapper.html()).toMatchSnapshot();
	});

	it("links the series and movie to their IMDB pages", () => {
		watching.series = {
			label: "A Series",
			imdb: "https://www.imdb.com/title/series",
		};
		watching.movie = {
			label: "A Movie",
			imdb: "https://www.imdb.com/title/movie",
		};
		const wrapper = mount(Watching, { global: { stubs } });
		const hrefs = wrapper.findAll("a").map((a) => a.attributes("href"));
		expect(hrefs).toEqual([
			"https://www.imdb.com/title/series",
			"https://www.imdb.com/title/movie",
		]);
		expect(wrapper.text()).toContain("A Series");
		expect(wrapper.text()).toContain("A Movie");
	});

	it("renders only the entries whose data node exists", () => {
		watching.series = {
			label: "A Series",
			imdb: "https://www.imdb.com/title/series",
		};
		watching.movie = undefined;
		const wrapper = mount(Watching, { global: { stubs } });

		const items = wrapper.findAll("li");
		expect(items).toHaveLength(1);
		expect(wrapper.text()).toContain("Serie TV");
		expect(wrapper.text()).not.toContain("Film");
	});

	it("renders no entries when no data node exists", () => {
		watching.series = undefined;
		watching.movie = undefined;
		const wrapper = mount(Watching, { global: { stubs } });

		expect(wrapper.findAll("li")).toHaveLength(0);
	});
});
