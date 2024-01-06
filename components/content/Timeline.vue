<script setup lang="ts">
interface Props {
  events: string;
  years: string
}

const { events = "", years = "" } = defineProps<Props>();

const getItems = (list: string): string[] => list.split(",").map((item) => item.trim());

// const isEven = (n: number): boolean => (n % 2) === 0
</script>

<template>
  <section class="not-prose">
    <ul class="timeline timeline-vertical timeline-compact">
      <li v-for="(event, index) in getItems(events)" :key="index">
        <hr v-if="index !== 0" />
        <div class="timeline-start">{{ getItems(years)[index] }}</div>
        <div class="timeline-middle text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd" />
          </svg>
        </div>
        <div class="timeline-end timeline-box">{{ event }}</div>
        <hr v-if="index !== (getItems(events).length - 1)" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
section {
  & ul {
    & div.timeline-start {
      font-weight: 700;
    }

    & svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
}
</style>