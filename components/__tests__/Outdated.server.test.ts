import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import Outdated from "../Outdated.server.vue";

describe("Outdated", () => {
  // Mock current date to ensure consistent testing
  const currentYear = 2024;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(currentYear, 0, 1));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Snapshot test
  it("renders correctly when post is outdated", () => {
    const wrapper = mount(Outdated, {
      props: {
        date: "2020-01-01",
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it("shows warning when post is older than 2 years", () => {
    const wrapper = mount(Outdated, {
      props: {
        date: "2020-01-01",
      },
    });

    expect(wrapper.isVisible()).toBe(true);
    expect(wrapper.text()).toContain("ATTENZIONE!");
    expect(wrapper.text()).toContain(
      "Questo post ha qualche anno sulle spalle"
    );
  });

  it("doesn't show warning for recent posts", () => {
    const wrapper = mount(Outdated, {
      props: {
        date: "2023-01-01",
      },
    });

    expect(wrapper.find("div").exists()).toBe(false);
  });

  it("handles edge case of exactly 2 years", () => {
    const wrapper = mount(Outdated, {
      props: {
        date: "2022-01-01",
      },
    });

    expect(wrapper.find("div").exists()).toBe(false);
  });

  it("renders warning icon", () => {
    const wrapper = mount(Outdated, {
      props: {
        date: "2020-01-01",
      },
    });

    const svg = wrapper.find("svg");
    expect(svg.exists()).toBe(true);
    expect(svg.attributes("xmlns")).toBe("http://www.w3.org/2000/svg");
    expect(svg.attributes("viewBox")).toBe("0 0 24 24");
  });

  it("applies correct styling", () => {
    const wrapper = mount(Outdated, {
      props: {
        date: "2020-01-01",
      },
    });

    const div = wrapper.find("div");
    expect(div.exists()).toBe(true);
    // Add any specific style checks based on your CSS
  });

  it("handles invalid date gracefully", () => {
    const wrapper = mount(Outdated, {
      props: {
        date: "invalid-date",
      },
    });

    expect(wrapper.find("div").exists()).toBe(false);
  });

  it("handles empty date prop", () => {
    const wrapper = mount(Outdated, {
      props: {
        date: "",
      },
    });

    expect(wrapper.find("div").exists()).toBe(false);
  });

  it("calculates year difference correctly", () => {
    // Test various years
    const testCases = [
      { date: "2021-01-01", shouldShow: true },
      { date: "2022-01-01", shouldShow: false },
      { date: "2023-01-01", shouldShow: false },
      { date: "2024-01-01", shouldShow: false },
      { date: "2019-12-31", shouldShow: true },
    ];

    testCases.forEach(({ date, shouldShow }) => {
      const wrapper = mount(Outdated, {
        props: { date },
      });
      expect(wrapper.find("div").exists()).toBe(shouldShow);
    });
  });
});
