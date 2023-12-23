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

const { url } = defineProps<Props>();
</script>

<template>
  <div>
    <a target="_blank" rel="nofollow noopener noreferrer" :href="twitter(url || '')" class="hover:text-primary">Parlane su
      X (<i>Twitter</i>)</a>
    <span>•</span>
    <a target="_blank" rel="nofollow noopener noreferrer" :href="source(url || '')" class="hover:text-primary">Codice
      sorgente su GitHub</a>
  </div>
</template>

<style scoped>
div {
  display: flex;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  justify-content: center;
  font-size: 0.875rem;
  line-height: 1.25rem;

  & a {
    text-decoration: underline;
    text-decoration-style: dotted;
  }

  & span {
    display: inline-block;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>
