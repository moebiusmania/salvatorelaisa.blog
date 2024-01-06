<script setup lang="ts">
export interface Props {
  results: number;
  value: string;
}

const emit = defineEmits<{
  (e: "typing", value: string): void;
  (e: "clear"): void;
}>();

const onTyping = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("typing", target.value);
};

const { results, value } = defineProps<Props>();
</script>

<template>
  <form class="form-control">
    <div class="input-group">
      <input type="text" :value="value" placeholder="Cerca tra gli articoli (per titolo)"
        class="input input-bordered input-primary" @input="onTyping" />
      <button v-if="value.length !== 0" class="btn btn-square" type="button" @click="emit('clear')">
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
  margin-top: 2.5rem;
  margin-bottom: 2.5rem;

  & input {
    width: 100%;

    @media (min-width: 768px) {
      max-width: 36rem;
    }
  }

  & svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style>
