<script lang="ts" setup>
const { data } = await useAsyncData(() =>
	queryCollection("content").path("/pages/xmas").first(),
);
</script>

<template>
  <article class="content xmas-page">
    <h1>{{ data?.title }}</h1>
    <ContentRenderer :value="data || {}" />
    <hr />
  </article>
  <Tip />
</template>

<style scoped>
@import './xmas-page.css';
</style>
