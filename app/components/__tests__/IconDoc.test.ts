import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DocIcon from "../icons/Doc.server.vue";

describe("DocIcon", () => {
  it("renders correctly", () => {
    const wrapper = mount(DocIcon);
    expect(wrapper.exists()).toBe(true);
  });

  it("matches snapshot", () => {
    const wrapper = mount(DocIcon);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
