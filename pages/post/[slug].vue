<script lang="ts" setup>
const route = useRoute();
const slug: string = route.params.slug as string;

const { data: post } = await useAsyncData("post", () =>
  queryContent(`/${slug}`).findOne()
);

const date = (src: string): string =>
  new Date(src).toLocaleDateString("it-it", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

const source = (url: string): string =>
  `https://github.com/moebiusmania/salvatorelaisa.blog/blob/main/content${url}.md`;
const twitter = (url: string): string =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `https://salvatorelaisa.blog${url}`
  )} @moebiusmania - `;
</script>
<template>
  <div>
    <article class="prose max-w-none prose-a:text-primary">
      <header class="text-center mb-12">
        <dd class="text-base font-medium leading-6 mb-2">
          <time :datetime="date">Pubblicato: {{ date(post.date) }}</time>
        </dd>
        <h1
          class="text-3xl font-extrabold leading-9 tracking-tight sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 mb-4"
        >
          {{ post.title }}
        </h1>
        <p class="my-2">
          Tags:
          <NuxtLink
            v-for="tag in post.tags"
            class="uppercase inline-block mx-1 no-underline hover:text-primary-focus hover:underline"
            :href="`/tags/${tag}`"
            >{{ tag }}</NuxtLink
          >
        </p>
        <p class="my-2">
          <small>Tempo di lettura: {{ "1 minuto" }}</small>
        </p>
      </header>
      <ContentRenderer :value="post" />
    </article>
    <hr class="my-8 border-primary-content" />
    <div class="py-6 text-sm flex justify-center">
      <a
        target="_blank"
        rel="nofollow noopener noreferrer"
        :href="twitter(post._path)"
        class="hover:text-primary underline decoration-dotted"
        >Parlane su Twitter</a
      >
      <span class="inline-block px-2">•</span>
      <a
        target="_blank"
        rel="nofollow noopener noreferrer"
        :href="source(post._path)"
        class="hover:text-primary underline decoration-dotted"
        >Codice sorgente su GitHub</a
      >
    </div>
    <Tip />
  </div>
</template>
