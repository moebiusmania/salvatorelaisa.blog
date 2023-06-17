<script setup lang="ts">
import { ParsedContent } from "@nuxt/content/dist/runtime/types";

defineProps<{
  post: ParsedContent;
}>();
</script>

<template>
  <li class="py-8 flex flex-wrap md:flex-nowrap">
    <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
      <span class="mt-1 text-secondary">
        {{
          new Date(post.date).toLocaleDateString("it-it", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }}
      </span>
    </div>
    <div class="w-full md:flex-grow">
      <NuxtLink :href="`/post${post._path}`">
        <h2 class="text-2xl font-medium text-base-content title-font mb-2">
          {{ post.title }}
        </h2>
      </NuxtLink>
      <div class="flex flew-wrap">
        <NuxtLink
          v-for="tag in post.tags"
          class="mr-3 text-sm font-medium text-primary uppercase hover:text-primary-focus"
          :href="`/tags/${tag}`"
        >
          {{ tag }}
        </NuxtLink>
      </div>
      <p class="leading-relaxed mt-6 dark:text-base-content">
        {{ post.summary }}
      </p>
      <NuxtLink
        class="text-primary hover:text-primary-focus inline-flex items-center mt-4"
        :href="`/post${post._path}`"
      >
        Continua a leggere ({{
          post.readingTime.text.replace("min read", "minuti")
        }})
        <svg
          class="w-4 h-4 ml-2"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      </NuxtLink>
    </div>
  </li>
</template>
