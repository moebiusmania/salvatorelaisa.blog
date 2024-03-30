<script setup lang="ts">
defineProps<{
  value: string;
}>();
</script>

<template>
  <p>
    <small>Tempo di lettura: {{ value.replace("min read", "minuti") }}</small>
  </p>
</template>

<style scoped>
p {
  margin: var(--sp-1) 0;
}
</style>