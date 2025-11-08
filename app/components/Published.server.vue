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
  <div role="contentinfo" aria-label="Data di pubblicazione">
    <time :datetime="value">Pubblicato: {{ date(value) }}</time>
  </div>
</template>

<style scoped>
div {
  margin: 0;
  margin-bottom: var(--sp-1);
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 500;
  line-height: 1.5rem;
}
</style>
