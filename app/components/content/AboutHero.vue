<script setup lang="ts">
defineProps<{
	image?: string;
	role?: string;
}>();
</script>

<template>
  <section class="about-hero">
    <figure class="about-hero__portrait" :class="{ 'is-placeholder': !image }">
      <img v-if="image" :src="image" alt="Ritratto" loading="eager" />
      <span v-else class="about-hero__placeholder" aria-hidden="true">🙂</span>
    </figure>
    <div class="about-hero__body">
      <p v-if="role" class="about-hero__role kicker">{{ role }}</p>
      <div class="about-hero__lead">
        <slot />
      </div>
    </div>
  </section>
</template>

<style>
@import './AboutHero.css';
</style>
