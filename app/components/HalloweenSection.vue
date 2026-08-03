<script setup lang="ts">
import { computed, ref } from "vue";

interface HalloweenItem {
	title: string;
	badge?: string;
	url?: string;
	description?: string;
	featured?: boolean;
}

export interface Props {
	section: {
		heading?: string;
		icon?: string;
		items?: HalloweenItem[];
	};
}

const { section } = defineProps<Props>();

const openItem = ref<string | null>(null);

const open = computed(
	() => section?.items?.find((item) => item.title === openItem.value) ?? null,
);

const toggle = (title: string) => {
	openItem.value = openItem.value === title ? null : title;
};

const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

const sectionSlug = computed(() => slugify(section?.heading ?? ""));

const chipId = (title: string) => `chip-${sectionSlug.value}-${slugify(title)}`;
const panelId = (title: string) =>
	`panel-${sectionSlug.value}-${slugify(title)}`;
</script>

<template>
  <section class="halloween-section">
    <h2 v-if="section?.heading">
      <span v-if="section?.icon" aria-hidden="true">{{ section.icon }}</span>
      {{ section.heading }}
    </h2>
    <ul class="halloween-chips">
      <li v-for="item in section?.items" :key="item.title">
        <a
          v-if="item.url"
          class="halloween-chip"
          :class="{ featured: item.featured }"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="chip-title">{{ item.title }}</span>
          <span v-if="item.badge" class="sl-badge">{{ item.badge }}</span>
          <IconsExternal />
        </a>
        <button
          v-else-if="item.description"
          :id="chipId(item.title)"
          type="button"
          class="halloween-chip"
          :class="{ featured: item.featured, open: open?.title === item.title }"
          :aria-expanded="open?.title === item.title"
          :aria-controls="panelId(item.title)"
          @click="toggle(item.title)"
        >
          <span class="chip-title">{{ item.title }}</span>
          <span v-if="item.badge" class="sl-badge">{{ item.badge }}</span>
        </button>
        <span v-else class="halloween-chip" :class="{ featured: item.featured }">
          <span class="chip-title">{{ item.title }}</span>
          <span v-if="item.badge" class="sl-badge">{{ item.badge }}</span>
        </span>
      </li>
    </ul>
    <Transition name="halloween-accordion">
      <div v-if="open" class="halloween-accordion-wrap">
        <div class="halloween-accordion-clip">
          <p
            :id="panelId(open.title)"
            :key="open.title"
            class="halloween-accordion"
            role="region"
            :aria-labelledby="chipId(open.title)"
          >
            {{ open.description }}
          </p>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style>
@import './HalloweenSection.css';
</style>
