<script setup lang="ts">
interface Props {
  value: number | string;
}

const props = defineProps<Props>();

const formatReadingTime = (value: number | string): string => {
  if (typeof value === 'number') {
    return `${value} minuti`;
  }
  return value.replace('min read', 'minuti');
};
</script>

<template>
  <p class="reading">
    <small>Tempo di lettura: {{ formatReadingTime(value) }}</small>
  </p>
</template>

<style scoped>
p.reading {
  margin: 0 0 var(--sp-1);
}
</style>