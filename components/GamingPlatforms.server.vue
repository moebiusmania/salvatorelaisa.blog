<script setup lang="ts">
interface Props {
  platforms: Array<{
    label: string;
    url: string;
  }>;
}

const { platforms = [] } = defineProps<Props>();
</script>

<template>
  <p>
    Giocato su:
    <NuxtLink v-for="platform in platforms" :href="platform.url" class="sl-badge">{{
      platform.label }}</NuxtLink>
  </p>
</template>

<style>
@import url('./Badge.css');
</style>

<style scoped>
p {
  margin: var(--sp-1) 0;

  & a {
    margin: 0 var(--sp-05);
    text-decoration: none;
  }
}
</style>