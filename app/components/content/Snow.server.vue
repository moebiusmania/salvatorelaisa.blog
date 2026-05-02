<script setup lang="ts">
const { count = 10 } = defineProps<{
	count?: number;
}>();

const icons = ["❅", "❆"];

const snowflakes = Array.from({ length: count }, (_, index) => ({
	id: index,
	icon: icons[Math.floor(Math.random() * icons.length)],
}));
</script>

<template>
  <div class="snowflakes" role="presentation" aria-label="Decorative snowfall animation">
    <div v-for="snowflake in snowflakes" :key="snowflake.id" class="snowflake" role="presentation" aria-hidden="true">
      {{ snowflake.icon }}
    </div>
  </div>
</template>

<style scoped>
@import './Snow.css';
</style>