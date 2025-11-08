import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Tip from "../Tip.vue";
import Coffee from "../Coffee.vue";

describe("Tip", () => {
	it("renders correctly", () => {
		// Mock the Coffee component since it's a child component
		const wrapper = mount(Tip, {
			global: {
				components: {
					Coffee: Coffee,
				},
			},
		});
		expect(wrapper.html()).toMatchSnapshot();
	});
});
