import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ExternalIcon from "../icons/External.server.vue";

describe("ExternalIcon", () => {
	it("renders correctly", () => {
		const wrapper = mount(ExternalIcon);
		expect(wrapper.exists()).toBe(true);
	});

	it("matches snapshot", () => {
		const wrapper = mount(ExternalIcon);
		expect(wrapper.html()).toMatchSnapshot();
	});
});
