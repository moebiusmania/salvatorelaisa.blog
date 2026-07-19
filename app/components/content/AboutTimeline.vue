<template>
  <div class="about-timeline">
    <ol class="about-timeline__track">
      <slot />
    </ol>
    <p class="about-timeline__hint" aria-hidden="true">
      <span>scorri</span>
      <span class="about-timeline__arrow">→</span>
    </p>
  </div>
</template>

<style>
@import './AboutTimeline.css';
</style>
