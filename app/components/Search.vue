<script setup lang="ts">
import { ref, onMounted } from "vue";

export interface Props {
	results: number;
	value: string;
}

const emit = defineEmits<{
	(e: "typing", value: string): void;
	(e: "clear"): void;
}>();

const isJavaScriptEnabled = ref(false);

onMounted(() => {
	isJavaScriptEnabled.value = true;
});

const onTyping = (event: Event) => {
	const target = event.target as HTMLInputElement;
	emit("typing", target.value);
};

const { results, value } = defineProps<Props>();

const placeholders = {
	enabled: "Cerca tra gli articoli (per titolo)",
	disabled: "Ricerca disattivata, JavaScript non disponibile",
};
</script>

<template>
  <form class="search">
    <div>
      <input aria-label="" type="text" :value="value" :disabled="!isJavaScriptEnabled"
        :placeholder="placeholders[isJavaScriptEnabled ? 'enabled' : 'disabled']" @input="onTyping" />
      <Transition name="clear">
        <button v-if="value.length !== 0" type="button" @click="emit('clear')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </Transition>
    </div>
  </form>
  <p v-if="value.length !== 0">
    Risultato ricerca:
    <Transition name="count" mode="out-in">
      <strong :key="results">{{ results }}</strong>
    </Transition>
    articoli
  </p>
</template>

<style>
@import './Search.css';
</style>
