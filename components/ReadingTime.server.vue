<script setup lang="ts">
defineProps<{
  value: string;
}>();
</script>

<template>
  <p class="reading">
    <small>Tempo di lettura: {{ value.replace("min read", "minuti") }}</small>
  </p>
</template>

<style scoped>
p.reading {
  margin: 0 0 var(--sp-1);
}
</style>