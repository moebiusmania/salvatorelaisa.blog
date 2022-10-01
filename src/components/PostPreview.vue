<script setup lang="ts">
import { reading } from '../utils'

defineProps<{
  post: Record<string, any>
}>()
</script>

<template>
  <li class="py-8 flex flex-wrap md:flex-nowrap">
    <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
      <span class="mt-1 text-secondary">
        {{
          new Date(post.frontmatter.date).toLocaleDateString('it-it', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }}
      </span>
    </div>
    <div class="md:flex-grow">
      <a :href="post.url">
        <h2 class="text-2xl font-medium text-base-content title-font mb-2">
          {{ post.frontmatter.title }}
        </h2>
      </a>
      <div class="flex flew-wrap">
        <a
          v-for="tag in post.frontmatter.tags"
          class="mr-3 text-sm font-medium text-primary uppercase hover:text-primary-focus"
          :href="`/tags/${tag}`"
        >
          {{ tag }}
        </a>
      </div>
      <p class="leading-relaxed mt-6 dark:text-base-content">{{ post.frontmatter.summary }}</p>
      <a
        class="text-primary hover:text-primary-focus inline-flex items-center mt-4"
        :href="post.url"
      >
        Continua a leggere ({{ reading(post.rawContent) }})
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
      </a>
    </div>
  </li>
</template>
