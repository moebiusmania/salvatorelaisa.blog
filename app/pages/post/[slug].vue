<script lang="ts" setup>
import type { ContentCollectionItem } from "@nuxt/content";
import { SITE_TITLE } from "../../utils/config";

definePageMeta({
	pageTransition: {
		name: "slide-right",
		mode: "out-in",
	},
	middleware(to, from) {
		// @ts-ignore
		to.meta.pageTransition.name =
			+(to.params.id || 0) > +(from.params.id || 0)
				? "slide-left"
				: "slide-right";
	},
});

const route = useRoute();
const slug: string = route.params.slug as string;

const post: ContentCollectionItem | null = await queryCollection("content")
	.where("path", "=", `/${slug}`)
	.first();
const title: string = `${SITE_TITLE} - ${post?.title}`;

const isReview = (tags: Array<string>): boolean => {
	return tags.includes("gaming") && tags.includes("recensione");
};
</script>

<template>
  <div class="post-slug" v-if="post">

    <Head>
      <Title>{{ title }}</Title>
      <Meta name="title" :content="title" />

      <!-- Open Graph / Facebook -->
      <Meta property="og:type" content="website" />
      <Meta property="og:url" :content="`https://salvatorelaisa.blog/post${post.path}`" />
      <Meta property="og:title" :content="title" />
      <Meta property="og:image" :content="post.meta.images[0]" />

      <!-- Twitter -->
      <Meta property="twitter:card" content="summary_large_image" />
      <Meta property="twitter:url" :content="`https://salvatorelaisa.blog/post${post.path}`" />
      <Meta property="twitter:title" :content="title" />
      <Meta property="twitter:image" :content="post.meta.images[0]" />
    </Head>

    <article class="content">
      <header>
        <Published :value="post.date" />
        <h1>{{ post.title }}</h1>
        <p>
          Tags:
          <NuxtLink v-for="tag in post.tags" :href="`/tags/${tag}`">{{
            tag }}</NuxtLink>
        </p>
        <ReadingTime :value="post.readingTime" />
        <GamingPlatforms v-if="isReview(post.tags)" :platforms="post.platforms || []" />
        <Outdated :date="post.date" />
      </header>
      <ContentRenderer :value="post" />
    </article>
    <hr />
    <Sharing :url="post.path" />
    <Tip />
  </div>
</template>

<style scoped>
@import './post-slug.css';
</style>

<style>
@import "@/styles/slide-animations.css";
</style>
