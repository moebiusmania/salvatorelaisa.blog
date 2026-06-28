<script setup lang="ts">
import { NOW_EVENT } from "@/utils/now";
</script>

<template>
  <article class="now-card now-event">
    <p class="now-card-kicker">Prossimo evento</p>
    <h2>
      <NuxtLink :href="NOW_EVENT.url" target="_blank" rel="noopener">
        {{ NOW_EVENT.name }}
        <IconsExternal />
      </NuxtLink>
    </h2>
    <p v-if="NOW_EVENT.date" class="now-event-date">
      <span aria-label="calendario" role="img">📅</span> {{ NOW_EVENT.date }}
    </p>
  </article>
</template>

<style>
@import './card.css';
</style>

<style>
@import './Event.css';
</style>
