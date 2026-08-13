import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BookDialog from "../BookDialog.vue";

const book = {
	path: "/books/dune",
	title: "Dune",
	author: "Frank Herbert",
	language: "en",
	read: "2022-09-20",
	url: "https://example.com/dune",
	body: { type: "root", children: [] },
};

const stubs = { ContentRenderer: true, IconsExternal: true };

const createWrapper = (value: typeof book | null) =>
	mount(BookDialog, {
		props: { book: value as never },
		global: { stubs },
	});

describe("BookDialog", () => {
	it("matches snapshot with a book", () => {
		expect(createWrapper(book).html()).toMatchSnapshot();
	});

	it("renders nothing inside the dialog when no book is selected", () => {
		const wrapper = createWrapper(null);

		expect(wrapper.find("dialog").exists()).toBe(true);
		expect(wrapper.find("h2").exists()).toBe(false);
	});

	it("renders title, author, uppercased language and read date", () => {
		const wrapper = createWrapper(book);

		expect(wrapper.find("h2").text()).toBe("Dune");
		expect(wrapper.find(".book-dialog__meta").text()).toContain("Frank Herbert");
		expect(wrapper.find(".book-dialog__meta").text()).toContain("EN");
		expect(wrapper.find(".book-dialog__meta").text()).toContain("Letto:");
	});

	it("omits the external link when the book has no url", () => {
		const { url, ...withoutUrl } = book;
		const wrapper = createWrapper(withoutUrl as typeof book);

		expect(wrapper.find(".book-dialog__link").exists()).toBe(false);
	});

	it("omits the read date when the book has none", () => {
		const { read, ...withoutRead } = book;
		const wrapper = createWrapper(withoutRead as typeof book);

		expect(wrapper.find(".book-dialog__meta").text()).not.toContain("Letto:");
	});

	it("emits close from the close button", async () => {
		const wrapper = createWrapper(book);
		await wrapper.find(".book-dialog__close").trigger("click");

		expect(wrapper.emitted("close")).toHaveLength(1);
	});

	it("emits close when the backdrop is clicked", async () => {
		const wrapper = createWrapper(book);
		await wrapper.find("dialog").trigger("click");

		expect(wrapper.emitted("close")).toHaveLength(1);
	});

	it("does not emit close when the dialog content is clicked", async () => {
		const wrapper = createWrapper(book);
		await wrapper.find("h2").trigger("click");

		expect(wrapper.emitted("close")).toBeUndefined();
	});
});
