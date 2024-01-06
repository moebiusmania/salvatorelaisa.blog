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
  <div>
    <nav>
      <NuxtLink v-if="prev > 0" class="text-primary hover:text-primary" :href="`/post/page/${prev}`">
        <button aria-label="precedente">&larr; Precedente</button>
      </NuxtLink>
      <button aria-label="precedente" v-else disabled class="text-neutral">
        &larr; Precedente
      </button>

      <span>Pagina {{ page }} di {{ totalPages }}</span>

      <NuxtLink v-if="allPosts === limit" class="text-primary hover:text-primary" :href="`/post/page/${next}`">
        <button aria-label="successivo">Successivo &rarr;</button>
      </NuxtLink>
      <button aria-label="successivo" v-else disabled class="text-neutral">
        Successivo &rarr;
      </button>
    </nav>
  </div>
</template>

<style scoped>
div {
  padding-top: 1.5rem;
  padding-bottom: 2rem;
  margin-top: 0.5rem;

  @media (min-width: 768px) {
    margin-top: 1.25rem;
  }

  & nav {
    display: flex;
    justify-content: space-between;

    & button {
      opacity: 0.4;
    }
  }
}
</style>
