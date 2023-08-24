<script setup lang="ts">
import { ParsedContent } from "@nuxt/content/dist/runtime/types";
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
  <article class="card bg-neutral-content shadow-xl border-none">
    <figure class="p-4 bg-base-100">
      <img :src="device.image" :alt="device.title" />
    </figure>
    <div class="card-body">
      <div>
        <span
          v-for="tag in device.tags"
          class="badge badge-primary mr-2 !text-base-100 no-underline"
          >{{ tag }}</span
        >
      </div>
      <p class="text-sm flex-none">
        Data di acquisto:
        {{ formatDate(device.purchase) }}
      </p>
      <h2 class="card-title">
        <NuxtLink
          class="underline hover:text-primary"
          :href="device.post || device.url"
        >
          {{ device.title }}
        </NuxtLink>
        <External v-if="device.url" class="w-4 h-4 inline-block" />
        <Doc v-if="device.post" class="w-4 h-4 inline-block" />
      </h2>
      <ContentRenderer :value="device" />
    </div>
  </article>
</template>
