<script setup lang="ts">
export interface Props {
  totalPages: number;
  page: number;
  limit: number;
  allPosts: number;
}

const { totalPages, page, limit, allPosts } = defineProps<Props>();

const prev: number = page - 1;
const next: number = page + 1;
</script>

<template>
  <div class="pt-6 pb-8 space-y-2 md:space-y-5">
    <nav class="flex justify-between">
      <NuxtLink
        v-if="prev > 0"
        class="text-primary hover:text-primary-focus"
        :href="`/post/page/${prev}`"
      >
        <button aria-label="precedente">&larr; Precedente</button>
      </NuxtLink>
      <button
        aria-label="precedente"
        v-else
        disabled
        class="text-neutral opacity-40"
      >
        &larr; Precedente
      </button>

      <span>Pagina {{ page }} di {{ totalPages }}</span>

      <NuxtLink
        v-if="allPosts === limit"
        class="text-primary hover:text-primary-focus"
        :href="`/post/page/${next}`"
      >
        <button aria-label="successivo">Successivo &rarr;</button>
      </NuxtLink>
      <button
        aria-label="successivo"
        v-else
        disabled
        class="text-neutral opacity-40"
      >
        Successivo &rarr;
      </button>
    </nav>
  </div>
</template>
