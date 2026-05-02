<script lang="ts" setup>
import type { ContentCollectionItem } from "@nuxt/content";

type Tag = {
	label: string;
	items: number;
};

const posts: Array<ContentCollectionItem> = await queryCollection("content")
	.where("draft", "=", false)
	.all();

const allTags: Array<string> = posts
	.map((post) => post.tags)
	.reduce((prev, curr) => prev.concat(curr));

const tags: Array<Tag> = [...new Set(allTags)]
	.map(
		(tag: string): Tag => ({
			label: tag,
			items:
				posts.filter((page: ContentCollectionItem): boolean =>
					page.tags.includes(tag),
				).length || 0,
		}),
	)
	.sort((a: Tag, b: Tag): number => b.items - a.items);
</script>

<template>
  <section class="tags-page">
    <hgroup>
      <h1>Tags</h1>
    </hgroup>
    <ul>
      <li v-for="tag in tags">
        <NuxtLink :href="`/tags/${tag.label}`">
          {{ tag.label }}</NuxtLink>
        <NuxtLink :href="`/tags/${tag.label}`">({{ tag.items }})</NuxtLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
@import './tags-page.css';
</style>
