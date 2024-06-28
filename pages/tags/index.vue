<script lang="ts" setup>
import type { ParsedContent } from "@nuxt/content";

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
  <section>
    <div>
      <h1>Tags</h1>
    </div>
    <div>
      <div v-for="tag in tags">
        <NuxtLink :href="`/tags/${tag.label}`">
          {{ tag.label }}</NuxtLink>
        <NuxtLink :href="`/tags/${tag.label}`">({{ tag.items }})</NuxtLink>
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
    margin-top: var(--sp-8);
    margin-left: var(--sp-3);
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-top-width: 0;
    gap: var(--sp-3);
  }

  &>div:first-child {
    padding-top: var(--sp-3);
    padding-bottom: var(--sp-4);
    margin-left: var(--sp-1);

    @media (min-width: 768px) {
      margin-top: var(--sp-3);
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
      margin-top: var(--sp-1);
      margin-bottom: var(--sp-1);
      margin-right: var(--sp-3);
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 300ms;

      :hover {
        text-decoration: underline;
      }

      &>a:first-child {
        margin-right: var(--sp-2);
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 500;
        text-transform: uppercase;
        color: var(--primary)
      }

      &>a:last-child {
        margin-left: calc(var(--sp-1) * -1);
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 600;
        color: rgb(75, 85, 99);
        text-transform: uppercase;
      }
    }
  }
}
</style>
