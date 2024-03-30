<script lang="ts" setup>
import type { ParsedContent } from "@nuxt/content/dist/runtime/types";

const route = useRoute();
const year: string = route.params.year as string;

const posts: ParsedContent[] = await queryContent()
  .where({ draft: false, date: { $regex: year } })
  .sort({ date: -1 })
  .find();
</script>

<template>
  <div>
    <p class="text-secondary">
      {{ posts.length }} articoli trovati
    </p>
    <h1 class="text-base-content">
      Ricerca per anno: {{ year }}
    </h1>
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

  & ul {
    margin-top: 2rem;
    margin-bottom: 2rem;
    border-top-width: 1px;
  }
}
</style>
