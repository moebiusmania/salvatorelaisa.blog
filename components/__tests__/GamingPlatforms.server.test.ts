import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import GamingPlatforms from "../GamingPlatforms.server.vue";

describe("GamingPlatforms", () => {
  const mockPlatforms = [
    {
      label: "PlayStation 5",
      url: "https://example.com/ps5",
    },
    {
      label: "Nintendo Switch",
      url: "https://example.com/switch",
    },
  ];

  // Snapshot test
  it("renders correctly", () => {
    const wrapper = mount(GamingPlatforms, {
      props: {
        platforms: mockPlatforms,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it("renders 'Giocato su:' text", () => {
    const wrapper = mount(GamingPlatforms, {
      props: {
        platforms: mockPlatforms,
      },
    });
    expect(wrapper.text()).toContain("Giocato su:");
  });

  it("renders all platform links", () => {
    const wrapper = mount(GamingPlatforms, {
      props: {
        platforms: mockPlatforms,
      },
    });

    const links = wrapper.findAll("a");
    expect(links.length).toBe(mockPlatforms.length);
  });

  it("renders correct platform labels and URLs", () => {
    const wrapper = mount(GamingPlatforms, {
      props: {
        platforms: mockPlatforms,
      },
    });

    const links = wrapper.findAll("a");
    links.forEach((link, index) => {
      expect(link.text()).toBe(mockPlatforms[index].label);
      expect(link.attributes("href")).toBe(mockPlatforms[index].url);
    });
  });

  it("applies sl-badge class to links", () => {
    const wrapper = mount(GamingPlatforms, {
      props: {
        platforms: mockPlatforms,
      },
    });

    const links = wrapper.findAll("a");
    links.forEach((link) => {
      expect(link.classes()).toContain("sl-badge");
    });
  });

  it("handles empty platforms array", () => {
    const wrapper = mount(GamingPlatforms, {
      props: {
        platforms: [],
      },
    });

    expect(wrapper.text()).toContain("Giocato su:");
    expect(wrapper.findAll("a").length).toBe(0);
  });

  it("handles undefined platforms prop", () => {
    const wrapper = mount(GamingPlatforms);

    expect(wrapper.text()).toContain("Giocato su:");
    expect(wrapper.findAll("a").length).toBe(0);
  });

  it("renders platforms in correct order", () => {
    const wrapper = mount(GamingPlatforms, {
      props: {
        platforms: mockPlatforms,
      },
    });

    const links = wrapper.findAll("a");
    expect(links[0].text()).toBe("PlayStation 5");
    expect(links[1].text()).toBe("Nintendo Switch");
  });
});
