<script lang="ts" setup>
const { data } = await useAsyncData("about", () =>
  queryContent("/pages/about").findOne()
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
      font-size: 3rem;
      line-height: 1;
    }
  }

  & hr {
    border: 0;
    border-top: 1px solid var(--border);
    margin: var(--sp-4) 0;
  }

  a {
    color: var(--primary);
  }
}
</style>
