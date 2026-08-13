<script setup lang="ts">
import type { BooksCollectionItem } from "@nuxt/content";
import { spineStyle } from "@/utils/books";

defineProps<{ book: BooksCollectionItem }>();
defineEmits<{ select: [book: BooksCollectionItem] }>();
</script>

<template>
  <button
    class="book-spine"
    type="button"
    :style="spineStyle(book)"
    :title="`${book.title} — ${book.author}`"
    @click="$emit('select', book)"
  >
    <span class="book-spine__text">
      <span class="book-spine__title">{{ book.title }}</span>
      <span class="book-spine__author">{{ book.author }}</span>
    </span>
  </button>
</template>

<style>
@import './BookSpine.css';
</style>
