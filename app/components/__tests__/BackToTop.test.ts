import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import BackToTop from "../BackToTop.vue";

describe("BackToTop", () => {
	// `scrollY` is a getter-only accessor on the window, so it has to be stubbed
	// rather than assigned. `vi.restoreAllMocks()` in afterEach puts it back.
	let scrollY: ReturnType<typeof vi.spyOn>;
	let intersectionObserver: typeof window.IntersectionObserver;

	beforeEach(() => {
		// Force the scroll fallback path: no header in the isolated mount and no
		// IntersectionObserver available in the test environment.
		intersectionObserver = window.IntersectionObserver;
		// @ts-expect-error - removing for the fallback branch under test
		delete window.IntersectionObserver;
		scrollY = vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		// Tests share a worker (`isolate: false`), so put the global back for
		// whichever file runs next.
		window.IntersectionObserver = intersectionObserver;
	});

	it("is hidden while the page is at the top", () => {
		const wrapper = mount(BackToTop);
		expect(wrapper.find(".back-to-top").exists()).toBe(false);
	});

	it("appears once the page is scrolled down", async () => {
		const wrapper = mount(BackToTop);

		scrollY.mockReturnValue(500);
		window.dispatchEvent(new Event("scroll"));
		await nextTick();

		const button = wrapper.find(".back-to-top");
		expect(button.exists()).toBe(true);
		expect(button.attributes("aria-label")).toBe("Torna su");
	});

	it("scrolls back to the top when clicked", async () => {
		const scrollTo = vi
			.spyOn(window, "scrollTo")
			.mockImplementation(() => {});

		const wrapper = mount(BackToTop);
		scrollY.mockReturnValue(500);
		window.dispatchEvent(new Event("scroll"));
		await nextTick();

		await wrapper.find(".back-to-top").trigger("click");
		expect(scrollTo).toHaveBeenCalledWith(
			expect.objectContaining({ top: 0 }),
		);
	});
});
