<script lang="ts" setup>
import type { ParsedContent } from "@nuxt/content/dist/runtime/types";
import { SITE_TITLE } from "@/utils/config";

definePageMeta({
  pageTransition: {
    name: "slide-right",
    mode: "out-in",
  },
  middleware(to, from) {
    // @ts-ignore
    to.meta.pageTransition.name =
      +to.params.id > +from.params.id ? "slide-left" : "slide-right";
  },
});

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

    <article class="prose prose-a:text-primary">
      <header>
        <Published :value="post.date" />
        <h1>{{ post.title }}</h1>
        <p>
          Tags:
          <NuxtLink v-for="tag in post.tags" class="hover:text-primary" :href="`/tags/${tag}`">{{
        tag }}</NuxtLink>
        </p>
        <ReadingTime :value="post.readingTime.text" />
        <GamingPlatforms v-if="isReview(post.tags)" :platforms="post.platforms" />
        <Outdated :date="post.date" />
      </header>
      <ContentRenderer :value="post" />
    </article>
    <hr class="border-neutral-content dark:border-neutral" />
    <Sharing :url="post._path" />
    <Tip />
  </div>
</template>

<style scoped>
div {
  &>article {
    max-width: none;

    & header {
      margin-bottom: 3rem;
      text-align: center;

      &>h1 {
        @media (min-width: 768px) {
          font-size: 3rem;
        }
      }

      &>p {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;

        & a {
          display: inline-block;
          margin-left: 0.25rem;
          margin-right: 0.25rem;
          text-decoration: none;
          text-transform: uppercase;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  &>hr {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
}
</style>

<style>
@import "../../utils/slide-animations.css";
</style>
