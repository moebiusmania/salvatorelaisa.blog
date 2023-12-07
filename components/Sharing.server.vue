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
  <div class="py-6 text-sm flex justify-center">
    <a target="_blank" rel="nofollow noopener noreferrer" :href="twitter(url || '')"
      class="hover:text-primary underline decoration-dotted">Parlane su X (<i>Twitter</i>)</a>
    <span class="inline-block px-2">•</span>
    <a target="_blank" rel="nofollow noopener noreferrer" :href="source(url || '')"
      class="hover:text-primary underline decoration-dotted">Codice sorgente su GitHub</a>
  </div>
</template>
