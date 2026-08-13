<script lang="ts" setup>
import type { BooksCollectionItem } from "@nuxt/content";
import type { Ref } from "vue";
import { ref } from "vue";
import { sortBooks } from "@/utils/books";

// Two ways to keep a book off the shelf, matching the devices convention:
// `draft: true` in the front matter, or a filename prefixed with "-".
//
// The dash has to be matched on `stem`, not `path`: the router strips a leading
// dash when it derives the route, so "/books/-foo.md" and "/books/foo.md" both
// end up at "/books/foo" and a path filter would silently match nothing. The
// pattern looks for a slash followed by a dash, i.e. any path segment that
// starts with one.
const all: BooksCollectionItem[] = await queryCollection("books")
	.where("draft", "IS NULL")
	.where("stem", "NOT LIKE", "%/-%")
	.all();

// Most recently read first, so the natural flex-wrap order pushes the older
// books down onto the next shelf.
const books: BooksCollectionItem[] = sortBooks(all);

const selected: Ref<BooksCollectionItem | null> = ref(null);
</script>

<template>
  <div class="books-page">
    <h1>Libri</h1>
    <p>
      Una libreria dei libri che ho letto, con due righe di commento su ognuno.
      Niente voti né stelline: solo quello che mi è rimasto.
    </p>
    <p>
      I libri sono in ordine di lettura, dal più recente al più vecchio, e
      quelli di cui non ricordo il periodo finiscono in fondo. Clicca su un
      libro per leggere il commento.
    </p>
    <ul class="shelf">
      <li v-for="book in books" :key="book.path" class="shelf__slot">
        <BookSpine :book="book" @select="selected = $event" />
      </li>
    </ul>
    <BookDialog :book="selected" @close="selected = null" />
  </div>
</template>

<style>
@import './books-page.css';
</style>
