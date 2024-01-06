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
  <article class="card bg-neutral-content">
    <figure>
      <img :src="device.image" :alt="device.title" />
    </figure>
    <div class="card-body dark:text-base-100">
      <div>
        <span v-for="tag in device.tags" class="badge badge-primary !text-base-100">{{ tag }}</span>
      </div>
      <p>
        Data di acquisto:
        {{ formatDate(device.purchase) }}
      </p>
      <h2 class="card-title">
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

<style scoped>
article {
  border-style: none;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  & figure {
    padding: 1rem;
    background-color: #ffffff;
  }

  &>div {
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
