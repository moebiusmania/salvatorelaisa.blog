<script setup lang="ts">
interface Props {
  url?: string;
}

const source = (url: string): string =>
  `https://github.com/moebiusmania/salvatorelaisa.blog/blob/main/content${url}.md`;

const twitter = (url: string): string =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `https://salvatorelaisa.blog${url}`
  )} @moebiusmania - `;

const threads = (url: string): string =>
  `https://threads.net/intent/post?text=${encodeURIComponent(
    `https://salvatorelaisa.blog${url}`
  )} @moebiusmania - `;

const { url } = defineProps<Props>();
</script>

<template>
  <div>
    <a target="_blank" rel="nofollow noopener noreferrer" :href="threads(url || '')">Parlane
      su Threads</a>
    <span>•</span>
    <a target="_blank" rel="nofollow noopener noreferrer" :href="twitter(url || '')">Parlane
      su X (<i>Twitter</i>)</a>
    <span>•</span>
    <a target="_blank" rel="nofollow noopener noreferrer" :href="source(url || '')">Codice
      sorgente su GitHub</a>
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  padding: var(--sp-1) 0 var(--sp-3);
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  line-height: 1.25rem;

  @media screen and (min-width: 768px) {
    flex-direction: row;
    align-items: start;
  }

  & a {
    text-decoration: underline;
    text-decoration-style: dotted;
    cursor: pointer;

    &:hover {
      color: var(--primary);
    }
  }

  & span {
    display: inline-block;
    padding: 0 var(--sp-1);
  }
}
</style>
