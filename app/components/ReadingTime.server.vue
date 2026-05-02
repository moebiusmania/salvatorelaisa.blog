<script setup lang="ts">
interface Props {
	value: number | string;
}

const props = defineProps<Props>();

const formatReadingTime = (value: number | string): string => {
	if (typeof value === "number") {
		return `${value} minuti`;
	}
	return value.replace("min read", "minuti");
};
</script>

<template>
  <p class="reading-time reading">
    <small>Tempo di lettura: {{ formatReadingTime(value) }}</small>
  </p>
</template>

<style>
@import './ReadingTime.css';
</style>