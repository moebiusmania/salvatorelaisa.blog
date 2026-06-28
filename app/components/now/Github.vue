<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getLatestRepos, NOW_GITHUB_USER, type Repo } from "@/utils/now";

const loading = ref(true);
const error = ref(false);
const repos = ref<Repo[]>([]);

onMounted(async () => {
  try {
    repos.value = await getLatestRepos(NOW_GITHUB_USER, 3);
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <article class="now-card now-github">
    <p class="now-card-kicker">Ultimi progetti su GitHub</p>

    <p v-if="loading" class="now-github-state">Caricamento…</p>

    <p v-else-if="error" class="now-github-state">
      Progetti non disponibili
    </p>

    <ul v-else>
      <li v-for="repo in repos" :key="repo.url">
        <NuxtLink :href="repo.url" target="_blank" rel="noopener">
          {{ repo.name }}
          <IconsExternal />
        </NuxtLink>
        <p v-if="repo.description" class="now-github-desc">
          {{ repo.description }}
        </p>
        <span v-if="repo.language" class="sl-badge">{{ repo.language }}</span>
      </li>
    </ul>
  </article>
</template>

<style>
@import url('../Badge.css');
</style>

<style>
@import './card.css';
</style>

<style>
@import './Github.css';
</style>
