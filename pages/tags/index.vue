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
  <section class="divide-gray-200 dark:divide-gray-700 md:space-x-6">
    <div>
      <h1>Tags</h1>
    </div>
    <div>
      <div v-for="tag in tags">
        <NuxtLink class="text-primary hover:text-primary" :href="`/tags/${tag.label}`">
          {{ tag.label }}</NuxtLink>
        <NuxtLink class="text-gray-600 dark:text-gray-300" :href="`/tags/${tag.label}`">({{ tag.items }})</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  border-top-width: 1px;
  border-color: #E5E7EB;

  @media (min-width: 768px) {
    margin-top: 6rem;
    margin-left: 1.5rem;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-top-width: 0;
  }

  &>div:first-child {
    padding-top: 1.5rem;
    padding-bottom: 2rem;
    margin-left: 0.5rem;

    @media (min-width: 768px) {
      margin-top: 1.25rem;
    }
  }

  & h1 {
    text-transform: capitalize;
  }

  &>div:last-child {
    display: flex;
    flex-wrap: wrap;
    max-width: 32rem;

    &>div {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      margin-right: 1.25rem;
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 300ms;

      :hover {
        text-decoration: underline;
      }

      &>a:first-child {
        margin-right: 0.75rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 500;
        text-transform: uppercase;
      }

      &>a:last-child {
        margin-left: -0.5rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 600;
        color: #4B5563;
        text-transform: uppercase;
      }
    }
  }
}
</style>
