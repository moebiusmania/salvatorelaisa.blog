import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Sharing from "../Sharing.vue";

describe("Sharing", () => {
	// Snapshot test
	it("renders correctly", () => {
		const wrapper = mount(Sharing, {
			props: {
				url: "/blog/test-article",
			},
		});
		expect(wrapper.html()).toMatchSnapshot();
	});

	// Unit tests
	it("generates correct source URL", () => {
		const wrapper = mount(Sharing, {
			props: {
				url: "/blog/test-article",
			},
		});

		const sourceLink = wrapper.find('a[href*="github.com"]');
		expect(sourceLink.exists()).toBe(true);
		expect(sourceLink.attributes("href")).toBe(
			"https://github.com/moebiusmania/salvatorelaisa.blog/blob/main/content/blog/test-article.md",
		);
	});

	it("generates correct Bluesky URL", () => {
		const wrapper = mount(Sharing, {
			props: {
				url: "/blog/test-article",
			},
		});

		const bskyLink = wrapper.find('a[href*="bsky.app"]');
		expect(bskyLink.exists()).toBe(true);
		expect(bskyLink.attributes("href")).toContain(
			"https://bsky.app/intent/compose?text=",
		);
		expect(bskyLink.attributes("href")).toContain(
			encodeURIComponent("https://salvatorelaisa.blog/post/blog/test-article"),
		);
		expect(bskyLink.attributes("href")).toContain("@moebiusmania.bsky.social");
	});

	it("handles undefined URL gracefully", () => {
		const wrapper = mount(Sharing);

		const sourceLink = wrapper.find('a[href*="github.com"]');
		const bskyLink = wrapper.find('a[href*="bsky.app"]');

		expect(sourceLink.attributes("href")).toBe(
			"https://github.com/moebiusmania/salvatorelaisa.blog/blob/main/content.md",
		);
		expect(bskyLink.attributes("href")).toContain(
			encodeURIComponent("https://salvatorelaisa.blog/post"),
		);
	});

	it("has correct security attributes on links", () => {
		const wrapper = mount(Sharing, {
			props: {
				url: "/blog/test-article",
			},
		});

		const links = wrapper.findAll("a");
		links.forEach((link) => {
			expect(link.attributes("target")).toBe("_blank");
			expect(link.attributes("rel")).toBe("nofollow noopener noreferrer");
		});
	});

	it("renders correct number of separator dots", () => {
		const wrapper = mount(Sharing, {
			props: {
				url: "/blog/test-article",
			},
		});

		const separators = wrapper.findAll("span");
		// Currently there should be 1 separator as Twitter is commented out
		expect(separators.length).toBe(1);
	});
});
