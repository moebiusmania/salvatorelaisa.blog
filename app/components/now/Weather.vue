<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getWeather, NOW_WEATHER_LOCATION, type Weather } from "@/utils/now";

const loading = ref(true);
const error = ref(false);
const data = ref<Weather | null>(null);

onMounted(async () => {
  try {
    data.value = await getWeather(NOW_WEATHER_LOCATION);
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <article class="now-card now-weather">
    <p class="now-card-kicker">Meteo</p>

    <p v-if="loading" class="now-weather-state">Caricamento…</p>

    <p v-else-if="error || !data" class="now-weather-state">
      Meteo non disponibile
    </p>

    <template v-else>
      <p class="now-weather-emoji" :aria-label="data.label" role="img">
        {{ data.emoji }}
      </p>
      <p class="now-weather-temp">{{ data.temperature }}°C</p>
      <p class="now-weather-meta">{{ data.label }} · {{ data.city }}</p>
    </template>
  </article>
</template>

<style>
@import './card.css';
</style>

<style>
@import './Weather.css';
</style>
