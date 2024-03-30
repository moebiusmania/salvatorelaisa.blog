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
