<script lang="ts" setup>
const { data } = await useAsyncData(() =>
	queryCollection("content").path("/pages/about").first(),
);
</script>

<template>
  <div class="about-page">
    <article class="content">
      <header>
        <h1>{{ data?.title }}</h1>
      </header>
      <ContentRenderer :value="data || {}" />
      <hr />
    </article>
    <Tip />
  </div>
</template>

<style scoped>
@import './about-page.css';
</style>
