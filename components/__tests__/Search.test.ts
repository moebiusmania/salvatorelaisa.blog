import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Search from "./../Search.vue";

describe("Search", () => {
  it("renders properly", () => {
    const wrapper = mount(Search, {
      props: {
        results: 0,
        value: "",
      },
    });
    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("emits typing event when input changes", async () => {
    const wrapper = mount(Search, {
      props: {
        results: 0,
        value: "",
      },
    });

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

    expect(wrapper.find("button").exists()).toBe(true);
  });

  it("emits clear event when clear button is clicked", async () => {
    const wrapper = mount(Search, {
      props: {
        results: 0,
        value: "test",
      },
    });

    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("clear")).toBeTruthy();
  });
});
