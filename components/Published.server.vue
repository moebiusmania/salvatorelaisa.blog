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
  <dd class="text-base font-medium leading-6 mb-2">
    <time :datetime="date">Pubblicato: {{ date(value) }}</time>
  </dd>
</template>
