import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";

const { getLatestRepos } = vi.hoisted(() => ({ getLatestRepos: vi.fn() }));

vi.mock("@/utils/now", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/utils/now")>();
	return { ...actual, getLatestRepos };
});

import Github from "../now/Github.vue";

const stubs = {
	NuxtLink: {
		template: '<a :href="href"><slot /></a>',
		props: ["href"],
	},
	IconsExternal: true,
};

describe("now/Github", () => {
	beforeEach(() => {
		getLatestRepos.mockReset();
	});

	it("shows a loading state before the data resolves", () => {
		getLatestRepos.mockReturnValue(new Promise(() => {}));
		const wrapper = mount(Github, { global: { stubs } });
		expect(wrapper.text()).toContain("Caricamento");
	});

	it("renders the fetched repositories on success", async () => {
		getLatestRepos.mockResolvedValue([
			{
				name: "repo-one",
				url: "https://github.com/user/repo-one",
				description: "First repo",
				language: "TypeScript",
				updatedAt: "2026-06-01T00:00:00Z",
			},
		]);
		const wrapper = mount(Github, { global: { stubs } });
		await flushPromises();

		const text = wrapper.text();
		expect(text).toContain("repo-one");
		expect(text).toContain("First repo");
		expect(text).toContain("TypeScript");
		expect(wrapper.find("a").attributes("href")).toBe(
			"https://github.com/user/repo-one",
		);
	});

	it("renders a fallback when the fetch fails", async () => {
		getLatestRepos.mockRejectedValue(new Error("boom"));
		const wrapper = mount(Github, { global: { stubs } });
		await flushPromises();

		expect(wrapper.text()).toContain("Progetti non disponibili");
	});
});
