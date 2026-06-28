import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

const { work } = vi.hoisted(() => ({
	work: { company: "Acme Inc", role: "Engineer", city: "Milano" },
}));

vi.mock("@/utils/now", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/utils/now")>();
	return {
		...actual,
		get NOW_WORK() {
			return work;
		},
	};
});

import Work from "../now/Work.server.vue";

describe("now/Work", () => {
	it("renders correctly", () => {
		const wrapper = mount(Work);
		expect(wrapper.html()).toMatchSnapshot();
	});

	it("renders the configured role, company and city", () => {
		const wrapper = mount(Work);
		const text = wrapper.text();
		expect(text).toContain(work.role);
		expect(text).toContain(work.company);
		expect(text).toContain(work.city);
	});
});
