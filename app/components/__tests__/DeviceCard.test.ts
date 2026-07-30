import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DeviceCard from "../DeviceCard.server.vue";

describe("DeviceCard", () => {
	it("matches snapshot", () => {
		const mockDevice = {
			title: "Test Device",
			image: "/test-image.jpg",
			tags: ["tag1", "tag2"],
			purchase: "2024-03-20",
			url: "https://example.com",
			body: "Test device description",
		};

		const wrapper = mount(DeviceCard, {
			props: {
				device: {
					...mockDevice,
					_id: "test-id",
					body: {
						type: "root",
						children: [{ type: "text", value: "Test device description" }],
					},
				},
			},
			global: {
				stubs: {
					NuxtLink: true,
					ContentRenderer: true,
					IconsExternal: true,
					IconsDoc: true,
				},
			},
		});

		expect(wrapper.html()).toMatchSnapshot();
	});
});
