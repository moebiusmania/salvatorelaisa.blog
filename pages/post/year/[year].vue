<script lang="ts" setup>
import { ParsedContent } from "@nuxt/content/dist/runtime/types";

const route = useRoute();
const year: string = route.params.year as string;

const posts: ParsedContent[] = await queryContent()
  .where({ draft: false, date: { $regex: year } })
  .sort({ date: -1 })
  .find();
</script>

<template>
  <div>
    <p class="text-xl leading-7 text-secondary mb-3">
      {{ posts.length }} articoli trovati
    </p>
    <h1
      class="text-3xl font-extrabold leading-9 tracking-tight text-base-content sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 capitalize">
      Ricerca per anno: {{ year }}
    </h1>
    <ul class="my-8 divide-y divide-neutral-content dark:divide-neutral">
      <PostPreview v-for="post in posts" :post="post" />
    </ul>
  </div>
</template>
