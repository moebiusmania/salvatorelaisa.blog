import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BookSpine from "../BookSpine.vue";
import { SPINE_HEIGHTS } from "@/utils/books";

const book = {
	path: "/books/dune",
	title: "Dune",
	author: "Frank Herbert",
	language: "en",
	read: "2022-09-20",
};

const createWrapper = (overrides = {}) =>
	mount(BookSpine, {
		props: { book: { ...book, ...overrides } as never },
	});

describe("BookSpine", () => {
	it("matches snapshot", () => {
		expect(createWrapper().html()).toMatchSnapshot();
	});

	it("renders the title and the author", () => {
		const wrapper = createWrapper();

		expect(wrapper.find(".book-spine__title").text()).toBe("Dune");
		expect(wrapper.find(".book-spine__author").text()).toBe("Frank Herbert");
	});

	it("emits select with the book when clicked", async () => {
		const wrapper = createWrapper();
		await wrapper.find("button").trigger("click");

		const emitted = wrapper.emitted("select");
		expect(emitted).toHaveLength(1);
		expect((emitted?.[0]?.[0] as typeof book).path).toBe("/books/dune");
	});

	it("applies the spine custom properties inline", () => {
		const style = createWrapper().find("button").attributes("style") || "";

		expect(style).toContain("--book-color");
		expect(style).toContain("--book-height");
		expect(style).toContain("--book-width");
		expect(style).toContain("--book-ink");
	});

	it("honours a front matter colour and height override", () => {
		const style =
			createWrapper({ color: "#b4551f", height: "xtall" })
				.find("button")
				.attributes("style") || "";

		expect(style).toContain("#b4551f");
		expect(style).toContain(SPINE_HEIGHTS.xtall);
	});
});
