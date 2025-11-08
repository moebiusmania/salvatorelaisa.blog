import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import Search from "../Search.vue";

describe("Search", () => {
	beforeEach(() => {
		// Reset any global state that might affect tests
	});

	it("renders properly with JavaScript enabled", async () => {
		const wrapper = mount(Search, {
			props: {
				results: 0,
				value: "",
			},
		});

		// Wait for onMounted to execute
		await wrapper.vm.$nextTick();

		const input = wrapper.find("input");
		expect(input.exists()).toBe(true);
		expect(input.attributes("disabled")).toBeUndefined();
		expect(input.attributes("placeholder")).toBe(
			"Cerca tra gli articoli (per titolo)",
		);
	});

	it("emits typing event when input changes", async () => {
		const wrapper = mount(Search, {
			props: {
				results: 0,
				value: "",
			},
		});

		// Wait for onMounted to execute
		await wrapper.vm.$nextTick();

		await wrapper.find("input").setValue("test");
		expect(wrapper.emitted("typing")).toBeTruthy();
		expect(wrapper.emitted("typing")?.[0]).toEqual(["test"]);
	});

	it("shows clear button when there is input", async () => {
		const wrapper = mount(Search, {
			props: {
				results: 0,
				value: "test",
			},
		});

		// Wait for onMounted to execute
		await wrapper.vm.$nextTick();

		expect(wrapper.find("button").exists()).toBe(true);
	});

	it("emits clear event when clear button is clicked", async () => {
		const wrapper = mount(Search, {
			props: {
				results: 0,
				value: "test",
			},
		});

		// Wait for onMounted to execute
		await wrapper.vm.$nextTick();

		await wrapper.find("button").trigger("click");
		expect(wrapper.emitted("clear")).toBeTruthy();
	});

	it("shows disabled placeholder when JavaScript is not available", () => {
		const wrapper = mount(Search, {
			props: {
				results: 0,
				value: "",
			},
		});

		// Don't wait for onMounted, so isJavaScriptEnabled remains false
		const input = wrapper.find("input");
		expect(input.attributes("placeholder")).toBe(
			"Ricerca disattivata, JavaScript non disponibile",
		);
	});

	it("input is disabled when JavaScript is not available", () => {
		const wrapper = mount(Search, {
			props: {
				results: 0,
				value: "",
			},
		});

		// Don't wait for onMounted, so isJavaScriptEnabled remains false
		const input = wrapper.find("input");
		expect(input.attributes("disabled")).toBe("");
	});

	it("input is enabled after JavaScript loads", async () => {
		const wrapper = mount(Search, {
			props: {
				results: 0,
				value: "",
			},
		});

		// Wait for onMounted to execute
		await wrapper.vm.$nextTick();

		const input = wrapper.find("input");
		expect(input.attributes("disabled")).toBeUndefined();
	});
});
