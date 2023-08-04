<script lang="ts" setup>
import { ParsedContent } from "@nuxt/content/dist/runtime/types";
import { SITE_TITLE } from "@/utils/config";

const route = useRoute();
const slug: string = route.params.slug as string;

const post: ParsedContent = await queryContent(`/${slug}`).findOne();
const title: string = `${SITE_TITLE} - ${post.title}`;

const date = (src: string): string =>
  new Date(src).toLocaleDateString("it-it", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

const isReview = (tags: Array<string>): boolean => {
  return tags.includes("gaming") && tags.includes("recensione");
};

const source = (url: string): string =>
  `https://github.com/moebiusmania/salvatorelaisa.blog/blob/main/content${url}.md`;
const twitter = (url: string): string =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `https://salvatorelaisa.blog${url}`
  )} @moebiusmania - `;
</script>
<template>
  <div>
    <Head>
      <Title>{{ title }}</Title>
      <Meta name="title" :content="title" />

      <!-- Open Graph / Facebook -->
      <Meta property="og:type" content="website" />
      <Meta
        property="og:url"
        :content="`https://salvatorelaisa.blog/post${post._path}`"
      />
      <Meta property="og:title" :content="title" />
      <Meta property="og:image" :content="post.images[0]" />

      <!-- Twitter -->
      <Meta property="twitter:card" content="summary_large_image" />
      <Meta
        property="twitter:url"
        :content="`https://salvatorelaisa.blog/post${post._path}`"
      />
      <Meta property="twitter:title" :content="title" />
      <Meta property="twitter:image" :content="post.images[0]" />
    </Head>

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
          <small
            >Tempo di lettura:
            {{ post.readingTime.text.replace("min read", "minuti") }}</small
          >
        </p>
        <p v-if="isReview(post.tags)" class="my-2">
          Giocato su:
          <NuxtLink
            v-for="platform in post.platforms"
            :href="platform.url"
            class="badge badge-primary mx-1 !text-base-100 no-underline"
            >{{ platform.label }}</NuxtLink
          >
        </p>
      </header>
      <ContentRenderer :value="post" />
    </article>
    <hr class="my-8 border-primary-content" />
    <div class="py-6 text-sm flex justify-center">
      <a
        target="_blank"
        rel="nofollow noopener noreferrer"
        :href="twitter(post._path || '')"
        class="hover:text-primary underline decoration-dotted"
        >Parlane su Twitter</a
      >
      <span class="inline-block px-2">•</span>
      <a
        target="_blank"
        rel="nofollow noopener noreferrer"
        :href="source(post._path || '')"
        class="hover:text-primary underline decoration-dotted"
        >Codice sorgente su GitHub</a
      >
    </div>
    <Tip />
  </div>
</template>
