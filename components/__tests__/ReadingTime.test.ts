import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ReadingTime from "../ReadingTime.server.vue";

describe("ReadingTime", () => {
  // Snapshot test
  it("renders correctly", () => {
    const wrapper = mount(ReadingTime, {
      props: {
        value: "5 min read",
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  // Unit tests
  it("replaces 'min read' with 'minuti'", () => {
    const wrapper = mount(ReadingTime, {
      props: {
        value: "5 min read",
      },
    });

    expect(wrapper.text()).toContain("5 minuti");
    expect(wrapper.text()).not.toContain("min read");
  });

  it("wraps text in small tag", () => {
    const wrapper = mount(ReadingTime, {
      props: {
        value: "3 min read",
      },
    });

    const smallTag = wrapper.find("small");
    expect(smallTag.exists()).toBe(true);
    expect(smallTag.text()).toContain("Tempo di lettura: 3 minuti");
  });

  it("applies correct CSS class", () => {
    const wrapper = mount(ReadingTime, {
      props: {
        value: "3 min read",
      },
    });

    const paragraph = wrapper.find("p");
    expect(paragraph.classes()).toContain("reading");
  });

  it("handles different minute values", () => {
    const testCases = ["1 min read", "10 min read", "15 min read"];

    testCases.forEach((value) => {
      const wrapper = mount(ReadingTime, {
        props: { value },
      });
      const expectedText = value.replace("min read", "minuti");
      expect(wrapper.text()).toContain(expectedText);
    });
  });
});
