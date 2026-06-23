<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

// Visible only once the page header (navigation) has scrolled out of view.
const visible = ref(false);

let observer: IntersectionObserver | null = null;
const onScrollFallback = () => {
	visible.value = window.scrollY > 200;
};

const scrollToTop = () => {
	const prefersReducedMotion =
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
};

onMounted(() => {
	const header = document.querySelector(".header");

	// Preferred: watch the header itself so the button mirrors the nav exactly.
	if (header && "IntersectionObserver" in window) {
		observer = new IntersectionObserver(
			([entry]) => {
				visible.value = !entry.isIntersecting;
			},
			{ threshold: 0 },
		);
		observer.observe(header);
		return;
	}

	// Fallback for environments without IntersectionObserver.
	window.addEventListener("scroll", onScrollFallback, { passive: true });
	onScrollFallback();
});

onBeforeUnmount(() => {
	if (observer) {
		observer.disconnect();
		observer = null;
	}
	window.removeEventListener("scroll", onScrollFallback);
});
</script>

<template>
  <Transition name="back-to-top">
    <button
      v-if="visible"
      type="button"
      class="back-to-top"
      title="Torna su"
      aria-label="Torna su"
      @click="scrollToTop"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
      <span>Torna su</span>
    </button>
  </Transition>
</template>

<style>
@import './BackToTop.css';
</style>
