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
  <div class="pagination">
    <nav>
      <NuxtLink v-if="prev > 0" :href="`/post/page/${prev}`">
        <button aria-label="precedente">&larr; Precedente</button>
      </NuxtLink>
      <button aria-label="precedente" v-else disabled>
        &larr; Precedente
      </button>

      <span>Pagina {{ page }} di {{ totalPages }}</span>

      <NuxtLink v-if="allPosts === limit" :href="`/post/page/${next}`">
        <button aria-label="successivo">Successivo &rarr;</button>
      </NuxtLink>
      <button aria-label="successivo" v-else disabled>
        Successivo &rarr;
      </button>
    </nav>
  </div>
</template>

<style scoped>
@import './Pagination.css';
</style>
