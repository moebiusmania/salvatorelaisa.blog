import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import HalloweenSection from "../HalloweenSection.vue";

interface HalloweenItem {
	title: string;
	badge?: string;
	url?: string;
	description?: string;
	featured?: boolean;
}

interface Section {
	heading?: string;
	icon?: string;
	items?: HalloweenItem[];
}

const baseSection: Section = {
	heading: "Videogiochi",
	icon: "🎮",
	items: [
		{ title: "Pumpkin Jack", description: "platformer arcade-style" },
		{ title: "Dusk" },
		{ title: "LoFi Girl", badge: "Spotify", url: "https://example.com" },
		{ title: "Diablo", description: "atmosfere gotiche" },
	],
};

const mountSection = (section: Section = baseSection) =>
	mount(HalloweenSection, {
		props: { section },
		global: {
			stubs: { IconsExternal: true },
		},
	});

describe("HalloweenSection", () => {
	it("renders the section heading and icon", () => {
		const wrapper = mountSection();
		expect(wrapper.find("h2").text()).toContain("Videogiochi");
		expect(wrapper.find("h2").text()).toContain("🎮");
	});

	it("renders one chip per item", () => {
		const wrapper = mountSection();
		expect(wrapper.findAll("li").length).toBe(4);
	});

	it("renders chips with a url as links", () => {
		const wrapper = mountSection();
		const link = wrapper.find("a.halloween-chip");
		expect(link.exists()).toBe(true);
		expect(link.attributes("href")).toBe("https://example.com");
		expect(link.attributes("target")).toBe("_blank");
		expect(link.attributes("rel")).toBe("noopener noreferrer");
		expect(link.find(".sl-badge").text()).toBe("Spotify");
	});

	it("renders chips with a description as buttons", () => {
		const wrapper = mountSection();
		const buttons = wrapper.findAll("button.halloween-chip");
		expect(buttons.length).toBe(2);
		expect(buttons[0].attributes("type")).toBe("button");
	});

	it("renders chips with neither url nor description as spans", () => {
		const wrapper = mountSection();
		const spans = wrapper.findAll("li > span.halloween-chip");
		expect(spans.length).toBe(1);
		expect(spans[0].text()).toBe("Dusk");
	});

	it("does not show the accordion panel by default", () => {
		const wrapper = mountSection();
		expect(wrapper.find(".halloween-accordion").exists()).toBe(false);
		expect(
			wrapper.findAll("button.halloween-chip")[0].attributes("aria-expanded"),
		).toBe("false");
	});

	it("opens the accordion showing the description when a description chip is clicked", async () => {
		const wrapper = mountSection();
		const button = wrapper.findAll("button.halloween-chip")[0];
		await button.trigger("click");
		const panel = wrapper.find(".halloween-accordion");
		expect(panel.exists()).toBe(true);
		expect(panel.text()).toBe("platformer arcade-style");
		expect(button.attributes("aria-expanded")).toBe("true");
		expect(button.classes()).toContain("open");
	});

	it("links the panel to the chip that opened it", async () => {
		const wrapper = mountSection();
		const button = wrapper.findAll("button.halloween-chip")[0];
		await button.trigger("click");
		const panel = wrapper.find(".halloween-accordion");
		expect(panel.attributes("role")).toBe("region");
		expect(panel.attributes("aria-labelledby")).toBe(button.attributes("id"));
		expect(panel.attributes("id")).toBe(button.attributes("aria-controls"));
	});

	it("closes the accordion when the same chip is clicked again", async () => {
		const wrapper = mountSection();
		const button = wrapper.findAll("button.halloween-chip")[0];
		await button.trigger("click");
		await button.trigger("click");
		expect(button.attributes("aria-expanded")).toBe("false");
		await vi.waitFor(() =>
			expect(wrapper.find(".halloween-accordion").exists()).toBe(false),
		);
	});

	it("swaps the description when a different chip in the same section is clicked", async () => {
		const wrapper = mountSection();
		const buttons = wrapper.findAll("button.halloween-chip");
		await buttons[0].trigger("click");
		await buttons[1].trigger("click");
		expect(wrapper.find(".halloween-accordion").text()).toBe(
			"atmosfere gotiche",
		);
		expect(buttons[0].attributes("aria-expanded")).toBe("false");
		expect(buttons[1].attributes("aria-expanded")).toBe("true");
	});

	it("renders a chip with both url and description as a link (link wins)", () => {
		const wrapper = mountSection({
			heading: "Mix",
			items: [
				{ title: "Both", url: "https://example.com", description: "ignored" },
			],
		});
		expect(wrapper.find("a.halloween-chip").exists()).toBe(true);
		expect(wrapper.findAll("button.halloween-chip").length).toBe(0);
	});

	it("shows no panel for sections without description chips", async () => {
		const wrapper = mountSection({
			heading: "Solo link",
			items: [{ title: "A", url: "https://a.example.com" }, { title: "B" }],
		});
		expect(wrapper.findAll("button.halloween-chip").length).toBe(0);
		await wrapper.find("span.halloween-chip").trigger("click");
		expect(wrapper.find(".halloween-accordion").exists()).toBe(false);
	});
});
