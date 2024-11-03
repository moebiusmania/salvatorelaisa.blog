import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PostPreview from "../PostPreview.vue";

describe("PostPreview", () => {
  const mockPost = {
    _path: "/test-post",
    title: "Test Post Title",
    date: "2024-03-20T10:00:00.000Z",
    tags: ["test", "vue"],
    summary: "This is a test post summary",
    readingTime: {
      text: "5 min read",
    },
  };

  // Snapshot test
  it("renders correctly", () => {
    const wrapper = mount(PostPreview, {
      props: {
        post: {
          ...mockPost,
          body: {
            type: "root",
            children: [],
          },
          _id: "test-id",
        },
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});
