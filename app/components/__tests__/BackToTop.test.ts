import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import BackToTop from "../BackToTop.vue";

describe("BackToTop", () => {
	beforeEach(() => {
		// Force the scroll fallback path: no header in the isolated mount and no
		// IntersectionObserver available in the test environment.
		// @ts-expect-error - removing for the fallback branch under test
		delete window.IntersectionObserver;
		window.scrollY = 0;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("is hidden while the page is at the top", () => {
		const wrapper = mount(BackToTop);
		expect(wrapper.find(".back-to-top").exists()).toBe(false);
	});

	it("appears once the page is scrolled down", async () => {
		const wrapper = mount(BackToTop);

		window.scrollY = 500;
		window.dispatchEvent(new Event("scroll"));
		await nextTick();

		const button = wrapper.find(".back-to-top");
		expect(button.exists()).toBe(true);
		expect(button.attributes("aria-label")).toBe("Torna su");
	});

	it("scrolls back to the top when clicked", async () => {
		const scrollTo = vi.fn();
		window.scrollTo = scrollTo;

		const wrapper = mount(BackToTop);
		window.scrollY = 500;
		window.dispatchEvent(new Event("scroll"));
		await nextTick();

		await wrapper.find(".back-to-top").trigger("click");
		expect(scrollTo).toHaveBeenCalledWith(
			expect.objectContaining({ top: 0 }),
		);
	});
});
