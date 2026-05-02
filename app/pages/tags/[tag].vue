<script lang="ts" setup>
import type { ContentCollectionItem } from "@nuxt/content";

const route = useRoute();
const tag: string = route.params.tag as string;

const posts: ContentCollectionItem[] = await queryCollection("content")
	.where("draft", "=", false)
	.where("tags", "LIKE", `%${tag}%`)
	.order("date", "DESC")
	.all();
</script>

<template>
  <div class="tag-page">
    <p>
      {{ posts.length }} articoli trovati con il tag
    </p>
    <h1>{{ tag }}</h1>
    <PostsList>
      <PostPreview v-for="post in posts" :post="post" />
    </PostsList>
  </div>
</template>

<style>
@import './tag-page.css';
</style>
