<script setup lang="ts">
import type { ParsedContent } from "@nuxt/content/dist/runtime/types";
import External from "./icons/External.server.vue";
import Doc from "./icons/Doc.server.vue";

defineProps<{
  device: ParsedContent;
}>();

const formatDate = (date: string): string => {
  const parts = date.split("-");
  return parts.length === 1 ? date : new Date(date).toLocaleDateString("it");
};
</script>

<template>
  <article class="bg-neutral-content">
    <figure>
      <img :src="device.image" :alt="device.title" />
    </figure>
    <div class="dark:text-base-100">
      <div>
        <span v-for="tag in device.tags" class="sl-badge">{{ tag }}</span>
      </div>
      <p>
        Data di acquisto:
        {{ formatDate(device.purchase) }}
      </p>
      <h2>
        <NuxtLink class="hover:text-primary" :href="device.post || device.url">
          {{ device.title }}
        </NuxtLink>
        <External v-if="device.url" />
        <Doc v-if="device.post" />
      </h2>
      <ContentRenderer :value="device" />
    </div>
  </article>
</template>

<style>
@import url('./Badge.css');
</style>

<style scoped>
/* 
Card component from DaisyUI
https://daisyui.com/components/card/
*/

article {
  border-style: none;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 4px;

  & figure {
    padding: 1rem;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-start-start-radius: inherit;
    border-start-end-radius: inherit;
    border-end-start-radius: unset;
    border-end-end-radius: unset;
  }

  &>div {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 0.5rem;
    padding: 32px;

    & span {
      margin-right: 0.5rem;
      text-decoration: none;
    }

    &>p {
      flex: none;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    &>h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      line-height: 1.75rem;
      font-weight: 600;

      & a {
        text-decoration: underline;
      }

      & svg {
        display: inline-block;
        width: 1rem;
        height: 1rem;
      }
    }
  }
}
</style>
