<script lang="ts" setup>
import { ParsedContent } from "@nuxt/content/dist/runtime/types";
import { SITE_DESCRIPTION } from "@/utils/config";

const posts: ParsedContent[] = await queryContent()
  .where({ draft: false })
  .sort({ date: -1 })
  .limit(5)
  .find();
</script>

<template>
  <div>
    <p class="text-xl leading-7 text-secondary">{{ SITE_DESCRIPTION }}</p>

    <ul class="my-8 divide-y divide-primary-content">
      <PostPreview v-for="post in posts" :post="post" />
    </ul>

    <section class="flex justify-end text-base font-medium leading-6">
      <NuxtLink href="/post/page/1" class="text-primary hover:primary-focus" aria-label="Tutti gli articoli">
        Tutti gli articoli &rarr;
      </NuxtLink>
    </section>
  </div>
</template>
