<script lang="ts" setup>
const { data } = await useAsyncData(() =>
	queryCollection("content").path("/pages/halloween").first(),
);
</script>

<template>
  <article class="content halloween-page">
    <h1>{{ data?.title }}</h1>
    <ContentRenderer :value="data || {}" />
    <hr />
  </article>
  <Tip />
</template>

<style scoped>
@import './halloween-page.css';
</style>