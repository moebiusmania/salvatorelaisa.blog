import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Pagination from "../Pagination.server.vue";

describe("Pagination", () => {
  // Helper function to create wrapper with common props
  const createWrapper = (page: number, totalPages: number) => {
    return mount(Pagination, {
      props: {
        page,
        totalPages,
        limit: 10,
        allPosts: totalPages * 10,
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ["to"],
          },
        },
      },
    });
  };

  // Snapshot test
  it("renders correctly", () => {
    const wrapper = createWrapper(2, 5);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it("renders page direction correctly", () => {
    const wrapper = createWrapper(2, 3);
    const links = wrapper.findAll("a");
    links.forEach((link) => {
      expect(link.text()).toBe(`← Precedente`);
    });
  });

  it("handles zero total pages gracefully", () => {
    const wrapper = createWrapper(1, 0);
    const links = wrapper.findAll("a");
    expect(links.length).toBe(0);
  });

  it("renders links in ascending order", () => {
    const wrapper = createWrapper(2, 5);
    const links = wrapper.findAll("a");
    const pageNumbers = links.map((link) => parseInt(link.text().trim()));

    for (let i = 1; i < pageNumbers.length; i++) {
      expect(pageNumbers[i]).toBeGreaterThan(pageNumbers[i - 1]);
    }
  });
});
