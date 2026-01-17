<script setup lang="ts">
const props = defineProps<{
	src?: string;
	alt?: string;
}>();

const attrs = useAttrs();

// Track if we've already rendered the first image on this page
const isFirstImage = useState("firstProseImage", () => true);

// Get the fetchpriority value - "high" for the first image, undefined for others
const fetchPriority = isFirstImage.value ? "high" : undefined;

// Mark that we've rendered the first image after this render
if (isFirstImage.value) {
	isFirstImage.value = false;
}

// Get src and alt from props or attrs, properly typed
const imageSrc = computed(() => {
	return props.src || (attrs.src as string | undefined);
});

const imageAlt = computed(() => {
	return props.alt || (attrs.alt as string | undefined);
});
</script>

<template>
	<img :src="imageSrc" :alt="imageAlt" :fetchpriority="fetchPriority" v-bind="attrs" />
</template>