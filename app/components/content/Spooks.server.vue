<script setup lang="ts">
const { count = 9 } = defineProps<{
	count?: number;
}>();

// Bats lead the cast (weighted), with the occasional ghost, bone and skull.
const icons = ["🦇", "🦇", "🦇", "👻", "👻", "🦴", "💀"];

// Random helper for varied, organic-looking drift. Values are computed once at
// SSR/generate time (same approach as Clouds/Snow), so each build bakes a fixed
// set of positions, speeds and sizes.
const rand = (min: number, max: number) => min + Math.random() * (max - min);

const spooks = Array.from({ length: count }, (_, index) => {
	const duration = rand(28, 55);
	return {
		id: index,
		icon: icons[Math.floor(Math.random() * icons.length)],
		// Inline CSS custom properties consumed by Spooks.css.
		style: {
			"--top": `${rand(2, 92).toFixed(1)}%`,
			"--duration": `${duration.toFixed(1)}s`,
			// Negative delay so spooks start already spread across the screen
			// instead of all entering from the left at once.
			"--delay": `${(-rand(0, duration)).toFixed(1)}s`,
			"--scale": rand(0.7, 1.4).toFixed(2),
			// Per-item bob timing so the vertical wobble is desynced.
			"--bob": `${rand(2.2, 4).toFixed(2)}s`,
		},
	};
});
</script>

<template>
  <div class="spooks" role="presentation" aria-label="Decorative drifting Halloween creatures animation">
    <div v-for="spook in spooks" :key="spook.id" class="spook" role="presentation" aria-hidden="true" :style="spook.style">
      <span class="spook-inner">{{ spook.icon }}</span>
    </div>
  </div>
</template>

<style>
@import './Spooks.css';
</style>
