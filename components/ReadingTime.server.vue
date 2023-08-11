<script setup lang="ts">
defineProps<{
  value: string;
}>();
</script>

<template>
  <p class="my-2">
    <small>Tempo di lettura: {{ value.replace("min read", "minuti") }}</small>
  </p>
</template>
