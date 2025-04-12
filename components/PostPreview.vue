<script setup lang="ts">
import type { ParsedContent } from "@nuxt/content";
import { PINNED_POST_DESCRIPTION } from "~/utils/config";

defineProps<{
  post: ParsedContent;
}>();
</script>

<template>
  <li :class="{ 'pinned': post.pinned }">
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
      <NuxtLink :href="`/post${post._path}`">
        <h2>
          {{ post.title }}
        </h2>
      </NuxtLink>
      <div>
        <NuxtLink v-for="tag in post.tags" :href="`/tags/${tag}`">
          {{ tag }}
        </NuxtLink>
      </div>
      <p>
        {{ post.summary }}
      </p>
      <NuxtLink :href="`/post${post._path}`">
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
  padding: var(--sp-4) 0;
  flex-wrap: wrap;
  position: relative;

  &.pinned {
    margin: var(--sp-4) 0;
    border: 1px solid var(--primary);
    border-top: 10px solid var(--primary);
    border-bottom: 10px solid var(--primary);
    padding: var(--sp-2);
    /* box-shadow: 0 0 20px 0 var(--primary); */

    @media (min-width: 768px) {
      border: 1px solid var(--primary);
      border-left: 10px solid var(--primary);
      padding-left: var(--sp-1);
    }

    & .badge {
      position: absolute;
      top: -35px;
      left: -1px;
      background-color: var(--primary);
      color: var(--white);
      padding: var(--sp-1);
      cursor: help;
      text-transform: uppercase;

      @media (min-width: 768px) {
        top: unset;
        bottom: 0;
      }
    }

    &>time {
      @media (min-width: 768px) {
        width: 14rem;
      }
    }
  }

  @media (min-width: 768px) {
    flex-wrap: nowrap;
  }

  &>time {
    display: flex;
    margin-bottom: var(--sp-3);
    flex-direction: column;

    @media (min-width: 768px) {
      margin-bottom: 0;
      width: 16rem;
    }

    & span {
      margin-top: var(--sp-05);
      color: var(--secondary)
    }
  }

  &>div:last-child {
    width: 100%;

    @media (min-width: 768px) {
      flex-grow: 1;
    }

    & h2 {
      margin-top: 0;
      margin-bottom: var(--sp-1);
      color: var(--text-base-content)
    }

    &>div {
      display: flex;
      flex-wrap: wrap;

      &>a {
        margin-right: var(--sp-2);
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 500;
        text-transform: uppercase;
        color: var(--primary);

        &:hover {
          text-decoration: underline;
        }
      }
    }

    & p {
      margin-top: var(--sp-3);
      line-height: 1.625;
    }

    &>a:last-child {
      display: inline-flex;
      margin-top: var(--sp-2);
      align-items: center;
      color: var(--primary);

      & svg {
        margin-left: var(--sp-1);
        width: 1rem;
        height: 1rem;
      }
    }
  }
}
</style>