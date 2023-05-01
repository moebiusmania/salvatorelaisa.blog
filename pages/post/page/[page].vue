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
  .find();

const totalPages: number = Math.ceil(allPosts.length / limit);

const initial: ParsedContent[] = await queryContent()
  .where({ draft: false })
  .sort({ date: -1 })
  .skip(limit * (page - 1))
  .limit(limit)
  .find();

posts.value = initial;

const onTyping = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  search.value = target.value;

  if (target.value.length > 0) {
    const results: ParsedContent[] = await queryContent()
      .where({ draft: false })
      .sort({ date: -1 })
      .find();

    const filtered: ParsedContent[] = results.filter((post) => {
      const title: string = post.title?.toString() || "";
      return title.toLowerCase().includes(target.value.toLowerCase());
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
    <input
      type="text"
      :value="search"
      placeholder="Cerca tra gli articoli (per titolo)"
      class="input input-bordered input-primary w-full md:max-w-xl my-10"
      @input="onTyping"
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
