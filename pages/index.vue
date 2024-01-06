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

    <p class="text-secondary">{{ SITE_DESCRIPTION }}</p>

    <ul class="divide-neutral-content dark:divide-neutral">
      <PostPreview v-for="post in posts" :post="post" />
    </ul>

    <section>
      <NuxtLink href="/post/page/1" class="text-primary hover:primary" aria-label="Tutti gli articoli">
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
    line-height: 1.75rem;
  }

  &>ul {
    margin-top: 2rem;
    margin-bottom: 2rem;
    border-top-width: 1px;
  }

  &>section {
    display: flex;
    justify-content: flex-end;
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 500;
    line-height: 1.5rem;
  }
}
</style>
