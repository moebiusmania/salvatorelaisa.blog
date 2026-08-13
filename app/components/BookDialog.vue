<script setup lang="ts">
import type { BooksCollectionItem } from "@nuxt/content";
import type { Ref } from "vue";
import { ref, watch } from "vue";
import { formatRead } from "@/utils/books";

const props = defineProps<{ book: BooksCollectionItem | null }>();
const emit = defineEmits<{ close: [] }>();

const dialog: Ref<HTMLDialogElement | null> = ref(null);

// `showModal()` is what buys the focus trap, the ::backdrop, Escape-to-close and
// the focus returning to the spine that opened the dialog — none of which is
// worth reimplementing. It is missing in the test DOM, hence the guard.
watch(
	() => props.book,
	(book): void => {
		const el = dialog.value;
		if (!el) return;

		if (book && typeof el.showModal === "function") {
			el.showModal();
		} else if (!book && typeof el.close === "function" && el.open) {
			el.close();
		}
	},
);

// A click landing on the dialog element itself (rather than on its content) is
// a click on the backdrop.
const onClick = (event: MouseEvent): void => {
	if (event.target === dialog.value) emit("close");
};
</script>

<template>
  <dialog
    ref="dialog"
    class="book-dialog"
    @click="onClick"
    @close="$emit('close')"
  >
    <template v-if="book">
      <button
        class="book-dialog__close"
        type="button"
        aria-label="Chiudi"
        @click="$emit('close')"
      >
        ✕
      </button>
      <h2>{{ book.title }}</h2>
      <p class="book-dialog__meta">
        <span>{{ book.author }}</span>
        <span>{{ book.language.toUpperCase() }}</span>
        <span v-if="book.read">Letto: {{ formatRead(book.read) }}</span>
      </p>
      <a v-if="book.url" class="book-dialog__link" :href="book.url" target="_blank" rel="noopener">
        Scheda del libro
        <IconsExternal />
      </a>
      <hr />
      <ContentRenderer :value="book" />
    </template>
  </dialog>
</template>

<style>
@import './BookDialog.css';
</style>
