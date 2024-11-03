import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Sharing from "../Sharing.vue";

describe("Sharing", () => {
  // Snapshot test
  it("renders correctly", () => {
    const wrapper = mount(Sharing, {
      props: {
        url: "/blog/test-article",
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  // Unit tests
  it("generates correct source URL", () => {
    const wrapper = mount(Sharing, {
      props: {
        url: "/blog/test-article",
      },
    });

    const sourceLink = wrapper.find('a[href*="github.com"]');
    expect(sourceLink.exists()).toBe(true);
    expect(sourceLink.attributes("href")).toBe(
      "https://github.com/moebiusmania/salvatorelaisa.blog/blob/main/content/blog/test-article.md"
    );
  });

  it("generates correct Threads URL", () => {
    const wrapper = mount(Sharing, {
      props: {
        url: "/blog/test-article",
      },
    });

    const threadsLink = wrapper.find('a[href*="threads.net"]');
    expect(threadsLink.exists()).toBe(true);
    expect(threadsLink.attributes("href")).toContain(
      "https://threads.net/intent/post?text="
    );
    expect(threadsLink.attributes("href")).toContain(
      encodeURIComponent("https://salvatorelaisa.blog/blog/test-article")
    );
  });

  it("handles undefined URL gracefully", () => {
    const wrapper = mount(Sharing);

    const sourceLink = wrapper.find('a[href*="github.com"]');
    const threadsLink = wrapper.find('a[href*="threads.net"]');

    expect(sourceLink.attributes("href")).toBe(
      "https://github.com/moebiusmania/salvatorelaisa.blog/blob/main/content.md"
    );
    expect(threadsLink.attributes("href")).toContain(
      encodeURIComponent("https://salvatorelaisa.blog")
    );
  });

  it("has correct security attributes on links", () => {
    const wrapper = mount(Sharing, {
      props: {
        url: "/blog/test-article",
      },
    });

    const links = wrapper.findAll("a");
    links.forEach((link) => {
      expect(link.attributes("target")).toBe("_blank");
      expect(link.attributes("rel")).toBe("nofollow noopener noreferrer");
    });
  });

  it("renders correct number of separator dots", () => {
    const wrapper = mount(Sharing, {
      props: {
        url: "/blog/test-article",
      },
    });

    const separators = wrapper.findAll("span");
    // Currently there should be 1 separator as Twitter is commented out
    expect(separators.length).toBe(1);
  });
});
