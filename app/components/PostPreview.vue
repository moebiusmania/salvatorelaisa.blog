<script setup lang="ts">
import type { ContentCollectionItem } from "@nuxt/content";
import { PINNED_POST_DESCRIPTION } from "~/utils/config";

const props = defineProps<{
	post: ContentCollectionItem;
}>();

// Strip the leading slash so the name matches the article page's slug.
const slug = computed(() => (props.post.path || "").replace(/^\//, ""));
</script>

<template>
  <li class="post-preview" :class="{ 'pinned': post.pinned }">
    <span v-if="post.pinned" class="badge" :title="PINNED_POST_DESCRIPTION">in evidenza</span>
    <time>
      <span>
        {{
          new Date(post.date).toLocaleDateString("it-it", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }}
      </span>
    </time>
    <div>
      <NuxtLink :href="`/post${post.path}`">
        <h2 :style="{ 'view-transition-name': `post-title-${slug}` }">
          {{ post.title }}
        </h2>
      </NuxtLink>
      <div>
        <NuxtLink v-for="tag in post.tags" :href="`/tags/${tag}`">
          {{ tag }}
        </NuxtLink>
      </div>
      <p>
        {{ post.meta?.summary || "" }}
      </p>
      <NuxtLink :href="`/post${post.path}`">
        Continua a leggere ({{
          post.readingTime
        }}) minuti
        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      </NuxtLink>
    </div>
  </li>
</template>

<style>
@import './PostPreview.css';
</style>