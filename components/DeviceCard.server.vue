<script setup lang="ts">
import type { ParsedContent } from "@nuxt/content";
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
  <article>
    <figure>
      <img :src="device.image" :alt="device.title" />
    </figure>
    <div>
      <div>
        <span v-for="tag in device.tags" class="sl-badge">{{ tag }}</span>
      </div>
      <p>
        Data di acquisto:
        {{ formatDate(device.purchase) }}
      </p>
      <h2>
        <NuxtLink :href="device.post || device.url">
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
  border-radius: var(--sp-05);
  background-color: var(--bg-neutral);

  & figure {
    padding: var(--sp-2);
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-start-start-radius: inherit;
    border-start-end-radius: inherit;
    border-end-start-radius: unset;
    border-end-end-radius: unset;
    width: 100%;
    margin: 0;

    & img {
      display: block;
      width: 100%;
      height: auto;
    }
  }

  &>div {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--sp-1);
    padding: var(--sp-4);
    color: var(--text-dark);

    &>div {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-1);
    }

    &>p {
      flex: none;
      font-size: 1rem;
      line-height: 1.25rem;
    }

    &>h2 {
      display: flex;
      align-items: center;
      gap: var(--sp-1);
      margin: 0;

      &>a {
        text-decoration: underline;
      }

      &>a:hover {
        color: var(--primary);
        text-decoration-color: var(--primary);
      }

      & svg {
        display: inline-block;
        width: 1rem;
        height: 1rem;
      }
    }

    &>div {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  }
}
</style>
