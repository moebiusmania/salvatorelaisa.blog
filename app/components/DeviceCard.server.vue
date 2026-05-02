<script setup lang="ts">
import type { DevicesCollectionItem } from "@nuxt/content";

defineProps<{
	device: DevicesCollectionItem;
}>();

const formatDate = (date: string): string => {
	const parts = date.split("-");
	return parts.length === 1 ? date : new Date(date).toLocaleDateString("it");
};
</script>

<template>
  <article class="device-card">
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

<style>
@import './DeviceCard.css';
</style>
