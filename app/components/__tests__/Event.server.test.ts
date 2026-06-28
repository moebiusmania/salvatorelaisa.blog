import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

const { event } = vi.hoisted(() => ({
	event: {
		name: "An Event",
		url: "https://example.com/event",
		date: "next month",
	},
}));

vi.mock("@/utils/now", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/utils/now")>();
	return {
		...actual,
		get NOW_EVENT() {
			return event;
		},
	};
});

import Event from "../now/Event.server.vue";

const stubs = {
	NuxtLink: {
		template: '<a :href="href"><slot /></a>',
		props: ["href"],
	},
	IconsExternal: true,
};

describe("now/Event", () => {
	it("renders correctly", () => {
		const wrapper = mount(Event, { global: { stubs } });
		expect(wrapper.html()).toMatchSnapshot();
	});

	it("renders the event name linking to its url", () => {
		const wrapper = mount(Event, { global: { stubs } });
		const link = wrapper.find("a");
		expect(link.attributes("href")).toBe(event.url);
		expect(wrapper.text()).toContain(event.name);
	});
});
