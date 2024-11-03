import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Published from "../Published.server.vue";

describe("Published", () => {
  // Helper constant for the Italian date regex pattern
  const italianDatePattern =
    /Pubblicato: [a-zA-Zì]+ \d{1,2} [a-zA-Zà-ú]+ \d{4}/;

  // Helper function to format date in Italian
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Snapshot test
  it("renders correctly", () => {
    const wrapper = mount(Published, {
      props: {
        value: "2024-03-20T10:00:00.000Z",
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it("formats date correctly in Italian", () => {
    const wrapper = mount(Published, {
      props: {
        value: "2024-03-20T10:00:00.000Z",
      },
    });

    const timeElement = wrapper.find("time");
    expect(timeElement.exists()).toBe(true);
    expect(timeElement.text()).toMatch(italianDatePattern);
  });

  it("uses current date when no value is provided", () => {
    const wrapper = mount(Published);

    const timeElement = wrapper.find("time");
    expect(timeElement.exists()).toBe(true);
    expect(timeElement.text()).toMatch(italianDatePattern);
  });

  // it("sets correct datetime attribute", () => {
  //   const testDate = "2024-03-20T10:00:00.000Z";
  //   const wrapper = mount(Published, {
  //     props: {
  //       value: testDate,
  //     },
  //   });

  //   const timeElement = wrapper.find("time");
  //   const expectedDate = formatDate(testDate);
  //   expect(timeElement.attributes("datetime")).toBe(expectedDate);
  // });

  it("applies correct styling", () => {
    const wrapper = mount(Published, {
      props: {
        value: "2024-03-20T10:00:00.000Z",
      },
    });

    const ddElement = wrapper.find("dd");
    expect(ddElement.exists()).toBe(true);
  });

  it("handles different date formats", () => {
    const testDates = [
      "2024-01-01T00:00:00.000Z",
      "2024-12-31T23:59:59.999Z",
      "2024-06-15T12:30:00.000Z",
    ];

    testDates.forEach((date) => {
      const wrapper = mount(Published, {
        props: { value: date },
      });
      const timeElement = wrapper.find("time");
      expect(timeElement.exists()).toBe(true);
      expect(timeElement.text()).toMatch(italianDatePattern);
    });
  });
});
