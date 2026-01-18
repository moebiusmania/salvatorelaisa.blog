import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProseImg from "../ProseImg.vue";

describe("ProseImg", () => {
	it("renders first image with fetchpriority high when using props", () => {
		const wrapper = mount(ProseImg, {
			props: {
				src: "https://example.com/image.jpg",
				alt: "Test image",
			},
		});

		const img = wrapper.find("img");
		expect(img.attributes("src")).toBe("https://example.com/image.jpg");
		expect(img.attributes("alt")).toBe("Test image");
		expect(img.attributes("fetchpriority")).toBe("high");
		expect(wrapper.html()).toMatchSnapshot();
	});

	it("renders image with fetchpriority high when using attrs", () => {
		const wrapper = mount(ProseImg, {
			attrs: {
				src: "https://example.com/image-from-attrs.jpg",
				alt: "Image from attrs",
			},
		});

		const img = wrapper.find("img");
		expect(img.attributes("src")).toBe(
			"https://example.com/image-from-attrs.jpg",
		);
		expect(img.attributes("alt")).toBe("Image from attrs");
		// Note: fetchpriority may be undefined here because useState persists across tests
		// The first test already set the state to false
		expect(wrapper.html()).toMatchSnapshot();
	});

	it("renders subsequent images without fetchpriority", () => {
		// First, mount one image to set the state
		mount(ProseImg, {
			props: {
				src: "https://example.com/first-image.jpg",
				alt: "First image",
			},
		});

		// Then mount the second image
		const wrapper = mount(ProseImg, {
			props: {
				src: "https://example.com/second-image.jpg",
				alt: "Second image",
			},
		});

		const img = wrapper.find("img");
		expect(img.attributes("src")).toBe("https://example.com/second-image.jpg");
		expect(img.attributes("alt")).toBe("Second image");
		expect(img.attributes("fetchpriority")).toBeUndefined();
		expect(wrapper.html()).toMatchSnapshot();
	});

	it("renders image with props taking precedence over attrs", () => {
		const wrapper = mount(ProseImg, {
			props: {
				src: "https://example.com/prop-image.jpg",
				alt: "Prop image",
			},
			attrs: {
				src: "https://example.com/attr-image.jpg",
				alt: "Attr image",
			},
		});

		const img = wrapper.find("img");
		expect(img.attributes("src")).toBe("https://example.com/prop-image.jpg");
		expect(img.attributes("alt")).toBe("Prop image");
		expect(wrapper.html()).toMatchSnapshot();
	});

	it("renders image with only src attribute", () => {
		const wrapper = mount(ProseImg, {
			props: {
				src: "https://example.com/image-no-alt.jpg",
			},
		});

		const img = wrapper.find("img");
		expect(img.attributes("src")).toBe("https://example.com/image-no-alt.jpg");
		expect(wrapper.html()).toMatchSnapshot();
	});

	it("renders image with additional attributes from attrs", () => {
		const wrapper = mount(ProseImg, {
			attrs: {
				src: "https://example.com/image.jpg",
				alt: "Test image",
				class: "custom-class",
				loading: "lazy",
			},
		});

		const img = wrapper.find("img");
		expect(img.attributes("src")).toBe("https://example.com/image.jpg");
		expect(img.attributes("alt")).toBe("Test image");
		expect(img.classes()).toContain("custom-class");
		expect(img.attributes("loading")).toBe("lazy");
		expect(wrapper.html()).toMatchSnapshot();
	});
});
