<script lang="ts" setup>
const { data } = await useAsyncData("about", () =>
  queryContent("/pages/about").findOne()
);
</script>

<template>
  <div>
    <article class="prose max-w-none prose-a:text-primary">
      <header>
        <h1
          class="text-3xl font-extrabold leading-9 tracking-tight sm:text-4xl sm:leading-10 md:text-5xl md:leading-14"
        >
          {{ data.title }}
        </h1>
      </header>
      <ContentRenderer :value="data" />
      <hr class="my-8" />
    </article>
    <Tip />
  </div>
</template>
