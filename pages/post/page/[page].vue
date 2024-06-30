<script lang="ts" setup>
import type { ParsedContent } from "@nuxt/content/";
import type { Ref } from "vue";
import { ref } from "vue";

definePageMeta({
  pageTransition: {
    name: "slide-right",
    mode: "out-in",
  },
  middleware(to, from) {
    // @ts-ignore
    to.meta.pageTransition.name =
      +to.params.id > +from.params.id ? "slide-left" : "slide-right";
  },
});

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

const filtered = (value: string): ParsedContent[] =>
  allPosts.filter((post) => {
    const title: string = post.title?.toString() || "";
    return title.toLowerCase().includes(value.toLowerCase());
  });

const onTyping = async (value: string): Promise<void> => {
  search.value = value;

  posts.value = value.length > 0 ? filtered(value) : initial;
};
</script>

<template>
  <div>
    <h1>Tutti gli articoli</h1>
    <Search :value="search" :results="posts.length" @typing="onTyping" @clear="onClear" />
    <PostsList>
      <TransitionGroup name="list">
        <PostPreview v-for="post in posts" :post="post" :key="post._path?.replace('/', '')" />
      </TransitionGroup>
    </PostsList>
    <Pagination v-if="search.length === 0" :total-pages="totalPages" :page="page" :limit="limit"
      :all-posts="posts.length" />
  </div>
</template>

<style scoped>
div {
  h1 {
    font-size: 3.75rem;
    line-height: 1;
    color: var(--text-base-content)
  }
}
</style>

<!-- 
  just following the Vue 3 docs here

  https://vuejs.org/guide/built-ins/transition-group.html
-->
<style>
.list-move,
/* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>

<style>
@import "../../../utils/slide-animations.css";
</style>
