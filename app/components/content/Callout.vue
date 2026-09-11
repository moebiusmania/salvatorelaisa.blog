<script setup lang="ts">
defineProps<{
	variant?: "disclaimer" | "privacy" | "info";
	title?: string;
	icon?: string;
}>();
</script>

<template>
  <aside class="callout" :class="`callout--${variant || 'info'}`">
    <p v-if="title" class="callout__header">
      <span v-if="icon" class="callout__icon" role="img" aria-hidden="true">{{ icon }}</span>
      <span class="callout__title">{{ title }}</span>
    </p>
    <div class="callout__body">
      <slot />
    </div>
  </aside>
</template>

<style>
@import './Callout.css';
</style>
