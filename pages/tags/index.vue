<script lang="ts" setup>
import type { ParsedContent } from "@nuxt/content/dist/runtime/types";

type Tag = {
  label: string;
  items: number;
};

const posts: Array<ParsedContent> = await queryContent()
  .where({ draft: false })
  .find();

const allTags: Array<string> = posts
  .map((post) => post.tags)
  .reduce((prev, curr) => prev.concat(curr));

const tags: Array<Tag> = [...new Set(allTags)]
  .map(
    (tag: string): Tag => ({
      label: tag,
      items:
        posts.filter(
          (page: ParsedContent): Array<ParsedContent> => page.tags.includes(tag)
        ).length || 0,
    })
  )
  .sort((a: Tag, b: Tag): number => b.items - a.items);
</script>

<template>
  <div
    class="flex flex-col items-start justify-start divide-y divide-gray-200 dark:divide-gray-700 md:justify-center md:items-center md:divide-y-0 md:flex-row md:space-x-6 md:mt-24">
    <div class="pt-6 pb-8 space-x-2 md:space-y-5">
      <h1
        class="text-3xl font-extrabold leading-9 tracking-tight text-base-content sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 capitalize">
        Tags
      </h1>
    </div>
    <div class="flex flex-wrap max-w-lg">
      <div v-for="tag in tags" class="mt-2 mb-2 mr-5 transition-all hover:underline">
        <NuxtLink class="mr-3 text-sm font-medium text-primary uppercase hover:text-primary" :href="`/tags/${tag.label}`">
          {{ tag.label }}</NuxtLink>
        <NuxtLink class="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
          :href="`/tags/${tag.label}`">({{ tag.items }})</NuxtLink>
      </div>
    </div>
  </div>
</template>
