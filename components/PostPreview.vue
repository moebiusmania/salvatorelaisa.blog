<script setup lang="ts">
import type { ParsedContent } from "@nuxt/content/dist/runtime/types";

defineProps<{
  post: ParsedContent;
}>();
</script>

<template>
  <li>
    <div>
      <span class="text-secondary">
        {{
          new Date(post.date).toLocaleDateString("it-it", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }}
      </span>
    </div>
    <div>
      <NuxtLink :href="`/post${post._path}`">
        <h2 class="text-base-content">
          {{ post.title }}
        </h2>
      </NuxtLink>
      <div>
        <NuxtLink v-for="tag in post.tags" class="text-primary hover:text-primary" :href="`/tags/${tag}`">
          {{ tag }}
        </NuxtLink>
      </div>
      <p class="dark:text-base-content">
        {{ post.summary }}
      </p>
      <NuxtLink class="text-primary hover:text-primary" :href="`/post${post._path}`">
        Continua a leggere ({{
          post.readingTime.text.replace("min read", "minuti")
        }})
        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      </NuxtLink>
    </div>
  </li>
</template>

<style scoped>
li {
  display: flex;
  padding-top: 2rem;
  padding-bottom: 2rem;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    flex-wrap: nowrap;
  }

  &>div:first-child {
    display: flex;
    margin-bottom: 1.5rem;
    flex-direction: column;

    @media (min-width: 768px) {
      margin-bottom: 0;
      width: 16rem;
    }

    & span {
      margin-top: 0.25rem;
    }
  }

  &>div:last-child {
    width: 100%;

    @media (min-width: 768px) {
      flex-grow: 1;
    }

    & h2 {
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
      line-height: 2rem;
      font-weight: 500;
    }

    &>div {
      display: flex;
      flex-wrap: wrap;

      &>a {
        margin-right: 0.75rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 500;
        text-transform: uppercase;
      }
    }

    & p {
      margin-top: 1.5rem;
      line-height: 1.625;
    }

    &>a:last-child {
      display: inline-flex;
      margin-top: 1rem;
      align-items: center;

      & svg {
        margin-left: 0.5rem;
        width: 1rem;
        height: 1rem;

      }
    }
  }
}
</style>