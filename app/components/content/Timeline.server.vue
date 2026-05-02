<script setup lang="ts">
interface Props {
	items: string;
	title?: string;
	description?: string;
}

const {
	items = "",
	title = "Timeline degli eventi",
	description = "Alcuni eventi che ho vissuto relativi all'articolo visualizzati in ordine cronologico",
} = defineProps<Props>();
const list = items.split(",").filter((item) => item.trim());

// Add methods for keyboard interaction
const handleItemClick = (event: KeyboardEvent) => {
	const target = event.target as HTMLElement;
	if (target.classList.contains("timeline-item")) {
		// Add any click handling logic here
		console.log("Timeline item clicked:", target.getAttribute("aria-label"));
	}
};
</script>

<template>
  <section class="timeline-container" role="region" :aria-label="title"
    :aria-describedby="description ? 'timeline-description' : undefined">

    <ul class="timeline" role="list" :aria-label="`${list.length} timeline items`">
      <li v-for="(item, index) in list" :key="index" class="timeline-item" role="listitem" :tabindex="0"
        :aria-label="`Timeline item ${index + 1} of ${list.length}: ${item.trim()}`" @keydown.enter="handleItemClick"
        @keydown.space.prevent="handleItemClick">
        <div class="timeline-content">
          <span class="timeline-text">{{ item.trim() }}</span>
        </div>
      </li>
    </ul>

    <div class="sr-only" aria-live="polite" aria-atomic="true">
      Timeline with {{ list.length }} items loaded
    </div>
  </section>
</template>

<style scoped>
@import './Timeline.css';
</style>