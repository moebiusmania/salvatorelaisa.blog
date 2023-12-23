<script lang="ts" setup>
const { data } = await useAsyncData("about", () =>
  queryContent("/pages/about").findOne()
);
</script>

<template>
  <div>
    <article class="prose prose-a:text-primary">
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
    font-size: 1.875rem;
    line-height: 2.25rem;
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 2.25rem;

    @media (min-width: 640px) {
      font-size: 2.25rem;
      line-height: 2.5rem;
      line-height: 2.5rem;
    }

    @media (min-width: 768px) {
      font-size: 3rem;
      line-height: 1;
    }

  }

  & hr {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
}
</style>
