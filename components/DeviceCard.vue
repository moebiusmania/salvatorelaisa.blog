<script setup lang="ts">
import { ParsedContent } from "@nuxt/content/dist/runtime/types";

defineProps<{
  device: ParsedContent;
}>();
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
      <h2 v-if="device.post" class="card-title">
        <NuxtLink class="underline" :href="device.post">{{
          device.title
        }}</NuxtLink>
      </h2>
      <h2 v-else class="card-title">{{ device.title }}</h2>
      <ContentRenderer :value="device" />
    </div>
  </article>
</template>
