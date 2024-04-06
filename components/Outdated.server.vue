<script setup lang="ts">
interface Props {
  date: string;
}

const { date = "" } = defineProps<Props>();

const postYear: number = new Date(date).getFullYear();
const current: number = new Date().getFullYear();

const isOutdated: boolean = current - postYear > 2;
</script>

<template>
  <div v-if="isOutdated">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <span><strong>ATTENZIONE!</strong> Questo post ha qualche anno sulle spalle, quindi è molto probabile che il
      contesto
      degli argomenti
      trattati non sia più attuale. Controlla la data di pubblicazione prima di continuare a leggere 🙂</span>
  </div>
</template>

<style scoped>
div {
  background-color: oklch(0.93 0 0);
  display: grid;
  gap: var(--sp-2);
  width: 100%;
  grid-auto-flow: column;
  grid-template-columns: auto minmax(auto, 1fr);
  justify-items: start;
  text-align: start;
  margin: var(--sp-5) 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  align-content: flex-start;
  align-items: center;
  border-width: 1px;
  padding: var(--sp-2);
  color: var(--text-base-content);

  & svg {
    width: 1.5rem;
    height: 1.5rem;
    stroke: currentColor;
  }
}
</style>