<script setup lang="ts">
import { NOW_WORK } from "@/utils/now";
</script>

<template>
  <article class="now-card now-work">
    <p class="now-card-kicker">Al lavoro</p>
    <h2>{{ NOW_WORK.role }}</h2>
    <p class="now-work-company">{{ NOW_WORK.company }}</p>
    <p class="now-work-city">
      <span aria-label="luogo" role="img">📍</span> {{ NOW_WORK.city }}
    </p>
  </article>
</template>

<style>
@import './card.css';
</style>

<style>
@import './Work.css';
</style>
