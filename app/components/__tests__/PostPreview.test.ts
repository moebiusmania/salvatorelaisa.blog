import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PostPreview from "../PostPreview.vue";

describe("PostPreview", () => {
  const mockPost = {
    _path: "/test-post",
    title: "Test Post Title",
    description: "Test description",
    date: "2024-03-20T10:00:00.000Z",
    tags: ["test", "vue"],
    pinned: false,
    draft: false,
    readingTime: 5,
    path: "/test-post",
    seo: {},
    id: "test-post",
    stem: "test-post",
    extension: "md",
    meta: {
      summary: "This is a test post summary",
      images: [],
    },
  };

  // Snapshot test for regular post
  it("renders correctly", () => {
    const wrapper = mount(PostPreview, {
      props: {
        post: {
          ...mockPost,
          body: {
            type: "minimark",
            value: [],
          },
        },
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  // Snapshot test for pinned post
  it("renders pinned post correctly", () => {
    const wrapper = mount(PostPreview, {
      props: {
        post: {
          ...mockPost,
          pinned: true,
          body: {
            type: "minimark",
            value: [],
          },
        },
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});
