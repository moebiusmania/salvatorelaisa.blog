import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Timeline from "../content/Timeline.server.vue";

describe("Timeline", () => {
	it("renders correctly with provided items", () => {
		const items = "Item 1,Item 2,Item 3";
		const wrapper = mount(Timeline, {
			props: {
				items,
			},
		});

		// Check if all items are rendered
		const listItems = wrapper.findAll("li");
		expect(listItems).toHaveLength(3);
		expect(listItems[0].text()).toBe("Item 1");
		expect(listItems[1].text()).toBe("Item 2");
		expect(listItems[2].text()).toBe("Item 3");
	});

	it("renders empty list when no items provided", () => {
		const wrapper = mount(Timeline, {
			props: {
				items: "",
			},
		});

		const listItems = wrapper.findAll("li");
		expect(listItems).toHaveLength(0);
	});

	it("filters out empty items", () => {
		const items = "Item 1,,Item 2, ,Item 3";
		const wrapper = mount(Timeline, {
			props: {
				items,
			},
		});

		const listItems = wrapper.findAll("li");
		expect(listItems).toHaveLength(3);
		expect(listItems[0].text()).toBe("Item 1");
		expect(listItems[1].text()).toBe("Item 2");
		expect(listItems[2].text()).toBe("Item 3");
	});

	it("matches snapshot", () => {
		const items = "Event 1,Event 2,Event 3";
		const wrapper = mount(Timeline, {
			props: {
				items,
			},
		});

		expect(wrapper.html()).toMatchSnapshot();
	});
});
