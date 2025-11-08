import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PostsList from "../PostsList.vue";

describe("PostsList", () => {
	// Snapshot test
	it("renders correctly", () => {
		const wrapper = mount(PostsList, {
			slots: {
				default: "<li>Test post item</li>",
			},
		});
		expect(wrapper.html()).toMatchSnapshot();
	});
});
