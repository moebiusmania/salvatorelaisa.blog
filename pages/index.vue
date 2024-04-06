<script lang="ts" setup>
import type { ParsedContent } from "@nuxt/content/dist/runtime/types";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/utils/config";

const posts: ParsedContent[] = await queryContent()
  .where({ draft: false })
  .sort({ date: -1 })
  .limit(5)
  .find();
</script>

<template>
  <div>

    <Head>
      <Meta name="generator" content="Nuxt" />

      <!-- Open Graph / Facebook -->
      <Meta property="og:type" content="website" />
      <Meta property="og:url" content="https://salvatorelaisa.blog" />
      <Meta property="og:title" :content="SITE_TITLE" />
      <Meta property="og:description" :content="SITE_DESCRIPTION" />
      <Meta property="og:image" content="https://salvatorelaisa.blog/static/images/twitter-card.png" />

      <!-- Twitter -->
      <Meta property="twitter:card" content="summary_large_image" />
      <Meta property="twitter:url" content="https://salvatorelaisa.blog" />
      <Meta property="twitter:title" :content="SITE_TITLE" />
      <Meta property="twitter:description" :content="SITE_DESCRIPTION" />
      <Meta property="twitter:image" content="https://salvatorelaisa.blog/static/images/twitter-card.png" />
    </Head>

    <p>{{ SITE_DESCRIPTION }}</p>

    <ul>
      <PostPreview v-for="post in posts" :post="post" />
    </ul>

    <section>
      <NuxtLink href="/post/page/1" aria-label="Tutti gli articoli">
        Tutti gli articoli &rarr;
      </NuxtLink>
    </section>
  </div>
</template>

<style scoped>
div {
  &>p {
    font-size: 1.25rem;
    line-height: 1.75rem;
    color: var(--text-secondary-content);
  }

  &>ul {
    border-top: 1px solid rgb(229, 231, 235);
    margin: var(--sp-4) 0;
  }

  &>section {
    display: flex;
    justify-content: flex-end;
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 500;

    &>a {
      color: var(--primary)
    }
  }
}
</style>
