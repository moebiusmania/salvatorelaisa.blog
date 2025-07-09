import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Footer from "../Footer.server.vue";

describe("Footer", () => {
  it("renders correctly", () => {
    const wrapper = mount(Footer);
    expect(wrapper.element).toMatchSnapshot();
  });

  it("displays the current year", () => {
    const wrapper = mount(Footer);
    const currentYear = new Date().getFullYear();
    expect(wrapper.text()).toContain(`© 2010 - ${currentYear}`);
  });
});
