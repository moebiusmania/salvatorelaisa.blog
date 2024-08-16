<script setup lang="ts">
interface Props {
  value: string;
}

const date = (src: string): string =>
  new Date(src).toLocaleDateString("it-it", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

const { value = new Date().toISOString() } = defineProps<Props>();
</script>

<template>
  <dd>
    <time :datetime="date">Pubblicato: {{ date(value) }}</time>
  </dd>
</template>

<style scoped>
dd {
  margin: 0;
  margin-bottom: var(--sp-1);
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 500;
  line-height: 1.5rem;
}
</style>
