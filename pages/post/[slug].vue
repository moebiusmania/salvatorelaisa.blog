<script lang="ts" setup>
import { ParsedContent } from "@nuxt/content/dist/runtime/types";
import { SITE_TITLE } from "@/utils/config";

definePageMeta({
  pageTransition: {
    name: 'slide-right',
    mode: 'out-in'
  },
  middleware(to, from) {
    // @ts-ignore
    to.meta.pageTransition.name = +to.params.id > +from.params.id ? 'slide-left' : 'slide-right'
  }
})

const route = useRoute();
const slug: string = route.params.slug as string;

const post: ParsedContent = await queryContent(`/${slug}`).findOne();
const title: string = `${SITE_TITLE} - ${post.title}`;

const isReview = (tags: Array<string>): boolean => {
  return tags.includes("gaming") && tags.includes("recensione");
};
</script>

<template>
  <div>

    <Head>
      <Title>{{ title }}</Title>
      <Meta name="title" :content="title" />

      <!-- Open Graph / Facebook -->
      <Meta property="og:type" content="website" />
      <Meta property="og:url" :content="`https://salvatorelaisa.blog/post${post._path}`" />
      <Meta property="og:title" :content="title" />
      <Meta property="og:image" :content="post.images[0]" />

      <!-- Twitter -->
      <Meta property="twitter:card" content="summary_large_image" />
      <Meta property="twitter:url" :content="`https://salvatorelaisa.blog/post${post._path}`" />
      <Meta property="twitter:title" :content="title" />
      <Meta property="twitter:image" :content="post.images[0]" />
    </Head>

    <article class="prose max-w-none prose-a:text-primary">
      <header class="text-center mb-12">
        <Published :value="post.date" />
        <h1
          class="text-3xl font-extrabold leading-9 tracking-tight sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 mb-4">
          {{ post.title }}
        </h1>
        <p class="my-2">
          Tags:
          <NuxtLink v-for="tag in post.tags"
            class="uppercase inline-block mx-1 no-underline hover:text-primary-focus hover:underline"
            :href="`/tags/${tag}`">{{ tag }}</NuxtLink>
        </p>
        <ReadingTime :value="post.readingTime.text" />
        <GamingPlatforms v-if="isReview(post.tags)" :platforms="post.platforms" />
      </header>
      <ContentRenderer :value="post" />
    </article>
    <hr class="my-8 border-primary-content" />
    <Sharing :url="post._path" />
    <Tip />
  </div>
</template>

<style>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.25s;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translate(-50px, 0);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translate(50px, 0);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translate(50px, 0);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translate(-50px, 0);
}
</style>