<script setup lang="ts">
import { NOW_WATCHING } from "@/utils/now";

// Only render an entry when its config node is present, so the widget gracefully
// shows just the series, just the movie, or nothing at all.
const items = [
  { type: "Serie TV", ...NOW_WATCHING.series },
  { type: "Film", ...NOW_WATCHING.movie },
].filter((item) => item.label && item.imdb);
</script>

<template>
  <article class="now-card now-watching">
    <p class="now-card-kicker">Cosa sto guardando</p>
    <ul>
      <li v-for="item in items" :key="item.type">
        <span class="now-watching-type">{{ item.type }}</span>
        <NuxtLink :href="item.imdb" target="_blank" rel="noopener">
          {{ item.label }}
          <IconsExternal />
        </NuxtLink>
      </li>
    </ul>
  </article>
</template>

<style>
@import './card.css';
</style>

<style>
@import './Watching.css';
</style>
