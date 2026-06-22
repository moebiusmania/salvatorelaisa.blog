<script setup lang="ts">
defineProps<{
	title?: string;
	period?: string;
	image?: string;
	icon?: string;
}>();
</script>

<template>
  <li class="about-milestone">
    <span class="about-milestone__marker" aria-hidden="true"></span>
    <figure class="about-milestone__figure" :class="{ 'is-placeholder': !image }">
      <img v-if="image" :src="image" :alt="title || ''" loading="lazy" />
      <span v-else class="about-milestone__icon" role="img" :aria-label="title">{{ icon || "•" }}</span>
    </figure>
    <p v-if="period" class="about-milestone__period kicker">{{ period }}</p>
    <p v-if="title" class="about-milestone__title">{{ title }}</p>
    <div class="about-milestone__desc">
      <slot />
    </div>
  </li>
</template>

<style>
@import './AboutMilestone.css';
</style>
