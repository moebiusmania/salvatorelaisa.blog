<script lang="ts" setup>
import type { ContentCollectionItem } from "@nuxt/content/";
import type { Ref } from "vue";
import { ref } from "vue";

const route = useRoute();
const search: Ref<string> = ref("");
const posts: Ref<ContentCollectionItem[]> = ref([]);
const page: number = parseInt(route.params.page as string);
const limit: number = 10;

const allPosts: ContentCollectionItem[] = await queryCollection("content")
	.where("draft", "=", false)
	.order("date", "DESC")
	.all();

const totalPages: number = Math.ceil(allPosts.length / limit);

const initial: ContentCollectionItem[] = await queryCollection("content")
	.where("draft", "=", false)
	.order("date", "DESC")
	.skip(limit * (page - 1))
	.limit(limit)
	.all();

posts.value = initial;

const onClear = (): void => {
	search.value = "";
	posts.value = initial;
};

const filtered = (value: string): ContentCollectionItem[] =>
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
  <div class="post-page">
    <h1>Tutti gli articoli</h1>
    <Search :value="search" :results="posts.length" @typing="onTyping" @clear="onClear" />
    <PostsList>
      <TransitionGroup name="list">
        <PostPreview v-for="post in posts" :post="post" :key="post.path?.replace('/', '')" />
      </TransitionGroup>
    </PostsList>
    <Pagination v-if="search.length === 0" :total-pages="totalPages" :page="page" :limit="limit"
      :all-posts="posts.length" />
  </div>
</template>

<style>
@import './post-page.css';
</style>

<!-- 
  just following the Vue 3 docs here

  https://vuejs.org/guide/built-ins/transition-group.html
-->
<style>
.list-move,
/* apply transition to moving (re-flowing) items */
.list-enter-active,
.list-leave-active {
  transition: all 0.35s ease;
}

/* entering items slide in from the right */
.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

/* filtered-out items fade, shrink and drift away to the left */
.list-leave-to {
  opacity: 0;
  transform: translateX(-40px) scale(0.95);
}

/* take leaving items out of flow so the remaining ones animate up smoothly.
   keep full width so the row doesn't collapse mid-animation. */
.list-leave-active {
  position: absolute;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .list-move,
  .list-enter-active,
  .list-leave-active {
    transition: none;
  }
}
</style>
