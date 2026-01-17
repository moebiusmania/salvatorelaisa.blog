<script setup lang="ts">
const props = defineProps<{
	src?: string;
	alt?: string;
}>();

// Track if we've already rendered the first image on this page
const isFirstImage = useState("firstProseImage", () => true);

// Get the fetchpriority value - "high" for the first image, undefined for others
const fetchPriority = isFirstImage.value ? "high" : undefined;

// Mark that we've rendered the first image after this render
if (isFirstImage.value) {
	isFirstImage.value = false;
}
</script>

<template>
	<img
		:src="src || $attrs.src"
		:alt="alt || $attrs.alt"
		:fetchpriority="fetchPriority"
		v-bind="$attrs"
	/>
</template>