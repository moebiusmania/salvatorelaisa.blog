import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Coffee from "../Coffee.vue";

describe("Coffee", () => {
  it("renders correctly", () => {
    const wrapper = mount(Coffee);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
