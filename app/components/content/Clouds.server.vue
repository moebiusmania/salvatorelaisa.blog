<script setup lang="ts">
const { count = 8 } = defineProps<{
	count?: number;
}>();

// Random helper for varied, organic-looking clouds. Values are computed once at
// SSR/generate time (same approach as Snow), so each build bakes a fixed set.
const rand = (min: number, max: number) => min + Math.random() * (max - min);

const clouds = Array.from({ length: count }, (_, index) => {
	const duration = rand(45, 90);
	return {
		id: index,
		// Inline CSS custom properties consumed by Clouds.css.
		style: {
			"--top": `${rand(2, 95).toFixed(1)}%`,
			"--duration": `${duration.toFixed(1)}s`,
			// Negative delay so clouds start already spread across the screen
			// instead of all entering from the left at once.
			"--delay": `${(-rand(0, duration)).toFixed(1)}s`,
			"--scale": rand(0.6, 1.2).toFixed(2),
		},
	};
});
</script>

<template>
  <div class="clouds" role="presentation" aria-label="Decorative drifting clouds animation">
    <div v-for="cloud in clouds" :key="cloud.id" class="cloud" role="presentation" aria-hidden="true" :style="cloud.style" />
  </div>
</template>

<style>
@import './Clouds.css';
</style>
