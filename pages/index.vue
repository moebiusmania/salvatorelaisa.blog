<script lang="ts" setup>
import { SITE_DESCRIPTION } from "@/utils/config";

const query = {
  path: "/content",
  where: { draft: false },
  limit: 5,
  sort: { date: -1 },
};
</script>

<template>
  <div>
    <p class="text-xl leading-7 text-secondary">{{ SITE_DESCRIPTION }}</p>

    <ContentList :query="query" v-slot="{ list }">
      <ul class="my-8 divide-y divide-primary-content">
        <PostPreview v-for="post in list" :post="post" />
      </ul>
    </ContentList>

    <section class="flex justify-end text-base font-medium leading-6">
      <NuxtLink
        href="/post/page/1"
        class="text-primary hover:primary-focus"
        aria-label="Tutti gli articoli"
      >
        Tutti gli articoli &rarr;
      </NuxtLink>
    </section>
  </div>
</template>
