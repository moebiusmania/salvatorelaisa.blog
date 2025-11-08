<script lang="ts" setup>
const { data } = await useAsyncData(() =>
	queryCollection("content").path("/pages/about").first(),
);
</script>

<template>
  <div>
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
article {
  max-width: none;

  & h1 {
    @media (min-width: 768px) {
      /* font-size: 3rem; */
      line-height: 1;
    }
  }

  a {
    color: var(--primary);
  }
}
</style>
