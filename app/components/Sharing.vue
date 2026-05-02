<script setup lang="ts">
interface Props {
	url?: string;
}

const source = (url: string): string =>
	`https://github.com/moebiusmania/salvatorelaisa.blog/blob/main/content${url}.md`;

// const twitter = (url: string): string =>
//   `https://twitter.com/intent/tweet?text=${encodeURIComponent(
//     `https://salvatorelaisa.blog${url}`
//   )} @moebiusmania - `;

// const threads = (url: string): string =>
//   `https://threads.net/intent/post?text=${encodeURIComponent(
//     `https://salvatorelaisa.blog${url}`
//   )} @moebiusmania - `;

const bsky = (url: string): string =>
	`https://bsky.app/intent/compose?text=${encodeURIComponent(
		`https://salvatorelaisa.blog/post${url}`,
	)} @moebiusmania.bsky.social - `;

const { url } = defineProps<Props>();
</script>

<template>
  <div class="sharing">
    <a target="_blank" rel="nofollow noopener noreferrer" :href="bsky(url || '')">Parlane
      su Bluesky</a>
    <span>•</span>
    <!-- <a target="_blank" rel="nofollow noopener noreferrer" :href="twitter(url || '')">Parlane
      su X (<i>Twitter</i>)</a>
    <span>•</span> -->
    <a target="_blank" rel="nofollow noopener noreferrer" :href="source(url || '')">Codice
      sorgente su GitHub</a>
  </div>
</template>

<style>
@import './Sharing.css';
</style>
