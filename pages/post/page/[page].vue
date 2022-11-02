<script lang="ts" setup>
import { ParsedContent } from "@nuxt/content/dist/runtime/types";

const route = useRoute();
const page: number = parseInt(route.params.page as string);
const limit: number = 10;
const prev: number = page - 1;
const next: number = page + 1;

const posts: ParsedContent[] = await queryContent()
  .where({ draft: false })
  .sort({ date: -1 })
  .skip(limit * (page - 1))
  .limit(limit)
  .find();
</script>

<template>
  <div>
    <h1
      class="text-3xl font-extrabold leading-9 tracking-tight text-base-content sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
      Tutti gli articoli
    </h1>
    <!-- <input
      type="text"
      placeholder="Cerca tra gli articoli"
      class="input input-bordered w-full md:max-w-xl my-10"
    /> -->
    <ul class="my-8 divide-y divide-primary-content">
      <PostPreview v-for="post in posts" :post="post" />
    </ul>
    <div class="pt-6 pb-8 space-y-2 md:space-y-5">
      <nav class="flex justify-between">
        <NuxtLink v-if="prev > 0" class="text-primary hover:text-primary-focus" :href="`/post/page/${prev}`">
          <button aria-label="precedente">&larr; Precedente</button>
        </NuxtLink>
        <button aria-label="precedente" v-else disabled class="text-neutral opacity-40">
          &larr; Precedente
        </button>

        <span>Pagina {{ page }}</span>

        <NuxtLink v-if="posts.length === limit" class="text-primary hover:text-primary-focus"
          :href="`/post/page/${next}`">
          <button aria-label="successivo">Successivo &rarr;</button>
        </NuxtLink>
        <button aria-label="successivo" v-else disabled class="text-neutral opacity-40">
          Successivo &rarr;
        </button>
      </nav>
    </div>
  </div>
</template>
