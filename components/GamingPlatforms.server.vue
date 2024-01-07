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
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;

  & a {
    margin-left: 0.25rem;
    margin-right: 0.25rem;
    text-decoration: none;
  }
}
</style>