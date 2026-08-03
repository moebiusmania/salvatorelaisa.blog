<script lang="ts" setup>
const { data } = await useAsyncData(() =>
	queryCollection("content").path("/pages/halloween").first(),
);
</script>

<template>
  <article class="content halloween-page">
    <h1>{{ data?.title }}</h1>
    <ContentRenderer :value="data || {}" />

    <HalloweenSection
      v-for="s in data?.sections"
      :key="s.heading"
      :section="s"
    />

    <hr />
  </article>
  <Tip />
</template>

<style>
@import url('../../components/Badge.css');
</style>

<style>
@import './halloween-page.css';
</style>
