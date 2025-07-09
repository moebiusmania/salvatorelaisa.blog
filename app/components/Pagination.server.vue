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
div {
  padding-top: var(--sp-3);
  padding-bottom: var(--sp-4);
  margin-top: 0.5rem;

  @media (min-width: 768px) {
    margin-top: var(--sp-2);
  }

  & nav {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &>a {
      opacity: 1;
      color: var(--primary);

      &>button {
        color: var(--primary);
      }
    }

    & button {
      color: var(--text-base-content);
      background-color: transparent;
      border: 0;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: var(--sp-1) var(--sp-2);
      border-radius: 2px;

      &:hover {
        color: var(--white);
        background-color: var(--primary);
      }
    }

    &>button:disabled {
      opacity: 0.4;
    }

  }
}
</style>
