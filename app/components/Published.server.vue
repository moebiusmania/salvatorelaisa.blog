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
  <div class="published" role="contentinfo" aria-label="Data di pubblicazione">
    <time :datetime="value">Pubblicato: {{ date(value) }}</time>
  </div>
</template>

<style scoped>
@import './Published.css';
</style>
