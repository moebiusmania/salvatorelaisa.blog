import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Header from "../Header.vue";

// Mock useRoute
vi.mock("#app", () => ({
  useRoute: () => ({
    path: "/about",
  }),
}));

describe("Header", () => {
  // Snapshot test
  it("renders correctly", () => {
    const wrapper = mount(Header, {
      props: {
        dark: false,
      },
      global: {
        stubs: {
          NuxtLink: true,
        },
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it("renders site logo with correct attributes", () => {
    const wrapper = mount(Header, {
      props: {
        dark: false,
      },
      global: {
        stubs: {
          NuxtLink: true,
        },
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});
