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
  <p class="my-2">
    Giocato su:
    <NuxtLink
      v-for="platform in platforms"
      :href="platform.url"
      class="badge badge-primary mx-1 !text-base-100 no-underline"
      >{{ platform.label }}</NuxtLink
    >
  </p>
</template>
