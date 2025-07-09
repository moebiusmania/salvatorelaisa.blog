<script setup lang="ts">
import { ref, onMounted } from 'vue'

export interface Props {
  results: number;
  value: string;
}

const emit = defineEmits<{
  (e: "typing", value: string): void;
  (e: "clear"): void;
}>();

const isJavaScriptEnabled = ref(false)

onMounted(() => {
  isJavaScriptEnabled.value = true
})

const onTyping = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("typing", target.value);
};

const { results, value } = defineProps<Props>();

const placeholders = {
  enabled: "Cerca tra gli articoli (per titolo)",
  disabled: "Ricerca disattivata, JavaScript non disponibile"
}
</script>

<template>
  <form>
    <div>
      <input aria-label="" type="text" :value="value" :disabled="!isJavaScriptEnabled"
        :placeholder="placeholders[isJavaScriptEnabled ? 'enabled' : 'disabled']" @input="onTyping" />
      <button v-if="value.length !== 0" type="button" @click="emit('clear')">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </form>
  <p v-if="value.length !== 0">
    Risultato ricerca: <strong>{{ results }}</strong> articoli
  </p>
</template>

<style scoped>
form {
  margin: var(--sp-5) 0;

  & div {
    display: flex;
    align-items: center;
  }

  & input {
    width: 100%;
    border-color: var(--primary);
    appearance: none;
    height: 3rem;
    padding-left: var(--sp-2);
    padding-right: var(--sp-2);
    font-size: 1rem;
    line-height: 1.5rem;
    border: 1px solid var(--primary);
    /* border-radius: 2px; */

    @media (min-width: 768px) {
      max-width: 36rem;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      border-color: var(--text-secondary-content);
    }

    &:focus {
      box-shadow: none;
      border-color: var(--primary);
      outline: var(--primary);
      outline-style: solid;
      outline-width: 2px;
      outline-offset: 2px;
    }
  }

  & svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  & button {
    display: inline-flex;
    padding: 0;
    width: 3rem;
    height: 3rem;
    min-height: 3rem;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    color: var(--text-base-content);
    background-color: oklch(0.93 0 0);
  }
}
</style>
