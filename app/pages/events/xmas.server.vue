<script lang="ts" setup>
const { data } = await useAsyncData(() =>
	queryCollection("content").path("/pages/xmas").first(),
);
</script>

<template>
  <article class="content">
    <h1>{{ data?.title }}</h1>
    <ContentRenderer :value="data || {}" />
    <hr />
  </article>
  <Tip />
</template>

<style scoped>
iframe {
  width: 100%;
  height: 450px;
  border: 1px solid var(--border);
}
</style>

