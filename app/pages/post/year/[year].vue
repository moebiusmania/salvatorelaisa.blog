<script lang="ts" setup>
import type { ContentCollectionItem } from "@nuxt/content";

const route = useRoute();
const year: string = route.params.year as string;

const posts: ContentCollectionItem[] = await queryCollection("content")
	.where("draft", "=", false)
	.where("date", "LIKE", `${year}%`)
	.order("date", "DESC")
	.all();
</script>

<template>
  <div class="post-year">
    <p>{{ posts.length }} articoli trovati</p>
    <h1>Ricerca per anno: {{ year }}</h1>
    <PostsList>
      <PostPreview v-for="post in posts" :post="post" />
    </PostsList>
  </div>
</template>

<style>
@import './post-year.css';
</style>
