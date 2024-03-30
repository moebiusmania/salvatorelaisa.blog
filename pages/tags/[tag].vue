<script lang="ts" setup>
import type { ParsedContent } from "@nuxt/content/dist/runtime/types";

const route = useRoute();
const tag: string = route.params.tag as string;

const posts: ParsedContent[] = await queryContent()
  .where({ draft: false, tags: { $in: [tag] } })
  .sort({ date: -1 })
  .find();
</script>

<template>
  <div>
    <p class="text-secondary">
      {{ posts.length }} articoli trovati con il tag
    </p>
    <h1 class="text-base-content">{{ tag }}</h1>
    <ul class="divide-neutral-content dark:divide-neutral">
      <PostPreview v-for="post in posts" :post="post" />
    </ul>
  </div>
</template>

<style scoped>
div {
  & p {
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
    line-height: 1.75rem;
    line-height: 1.75rem;
  }

  & h1 {
    text-transform: capitalize;
  }

  & ul {
    margin-top: 2rem;
    margin-bottom: 2rem;
    border-top-width: 1px;
  }
}
</style>
