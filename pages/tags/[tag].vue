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
    <p>
      {{ posts.length }} articoli trovati con il tag
    </p>
    <h1>{{ tag }}</h1>
    <ul>
      <PostPreview v-for="post in posts" :post="post" />
    </ul>
  </div>
</template>

<style scoped>
div {
  & p {
    margin-bottom: var(--sp-2);
    font-size: 1.25rem;
    line-height: 1.75rem;
    line-height: 1.75rem;
    color: var(--text-secondary-content);
  }

  & h1 {
    text-transform: capitalize;
    color: var(--text-base-content);
  }

  & ul {
    border-top: 1px solid rgb(229, 231, 235);
    margin: var(--sp-4) 0;
  }
}
</style>
