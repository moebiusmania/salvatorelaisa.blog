<script lang="ts" setup>
const BASE: number = 2010;
const CURRENT: number = new Date().getFullYear();
const difference: number = CURRENT - BASE + 1;
const years: Array<string> = Array.from(
	{ length: difference },
	(e, i) => BASE + i,
).map((e) => e.toString());
</script>

<template>
  <section class="post-year-index">
    <div>
      <h1>Anni</h1>
    </div>
    <div>
      <div v-for="year in years">
        <NuxtLink :href="`/post/year/${year}`">{{ year }}</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import './post-year-index.css';
</style>
