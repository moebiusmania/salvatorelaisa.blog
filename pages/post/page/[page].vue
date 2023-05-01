<script lang="ts" setup>
import { ParsedContent } from "@nuxt/content/dist/runtime/types";
import { ref, Ref } from "vue";

const route = useRoute();
const search: Ref<string> = ref("");
const posts: Ref<ParsedContent[]> = ref([]);
const page: number = parseInt(route.params.page as string);
const limit: number = 10;

const allPosts: ParsedContent[] = await queryContent()
  .where({ draft: false })
  .sort({ date: -1 })
  .find();

const totalPages: number = Math.ceil(allPosts.length / limit);

const initial: ParsedContent[] = await queryContent()
  .where({ draft: false })
  .sort({ date: -1 })
  .skip(limit * (page - 1))
  .limit(limit)
  .find();

posts.value = initial;

const onClear = (): void => {
  search.value = "";
  posts.value = initial;
};

const onTyping = async (value: string) => {
  search.value = value;

  if (value.length > 0) {
    const filtered: ParsedContent[] = allPosts.filter((post) => {
      const title: string = post.title?.toString() || "";
      return title.toLowerCase().includes(value.toLowerCase());
    });

    posts.value = filtered;
  } else {
    posts.value = initial;
  }
};
</script>

<template>
  <div>
    <h1
      class="text-3xl font-extrabold leading-9 tracking-tight text-base-content sm:text-4xl sm:leading-10 md:text-6xl md:leading-14"
    >
      Tutti gli articoli
    </h1>
    <Search
      :value="search"
      :results="posts.length"
      @typing="onTyping"
      @clear="onClear"
    />
    <ul class="my-8 divide-y divide-primary-content">
      <PostPreview v-for="post in posts" :post="post" />
    </ul>
    <Pagination
      v-if="search.length === 0"
      :total-pages="totalPages"
      :page="page"
      :limit="limit"
      :all-posts="posts.length"
    />
  </div>
</template>
