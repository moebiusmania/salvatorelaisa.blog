<script lang="ts" setup>
import type { ContentCollectionItem } from "@nuxt/content";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/utils/config";

const nonDrafts: ContentCollectionItem[] = await queryCollection("content")
	.where("draft", "=", false)
	.all();

const posts: ContentCollectionItem[] = await queryCollection("content")
	.where("draft", "=", false)
	.order("date", "DESC")
	.limit(5)
	.all();

const pinnedPost = nonDrafts.find((post) => post.pinned === true);

if (pinnedPost) {
	posts.unshift(pinnedPost);
}
</script>

<template>
  <div class="home-page">

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

    <PostsList>
      <PostPreview v-for="post in posts" :post="post" />
    </PostsList>

    <section>
      <NuxtLink href="/post/page/1" aria-label="Tutti gli articoli">
        Tutti gli articoli &rarr;
      </NuxtLink>
    </section>
  </div>
</template>

<style scoped>
@import './home-page.css';
</style>
