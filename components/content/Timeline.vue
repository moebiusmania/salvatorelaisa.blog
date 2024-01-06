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
/* 
Timeline component from DaisyUI 
https://daisyui.com/components/timeline/
*/
section {
  & ul {
    position: relative;
    display: flex;
    flex-direction: column;
    --timeline-row-start: 0;

    & li {
      --timeline-col-start: 0;
      --timeline-row-start: minmax(0, 1fr);
      --timeline-row-end: minmax(0, 1fr);
      justify-items: center;
      display: grid;
      flex-shrink: 0;
      align-items: center;
      grid-template-rows: var(--timeline-row-start, minmax(0, 1fr)) auto var(--timeline-row-end, minmax(0, 1fr));
      grid-template-columns: var(--timeline-col-start, minmax(0, 1fr)) auto var(--timeline-col-end, minmax(0, 1fr));
      position: relative;

      & hr {
        width: 0.25rem;
        height: 100%;
        border-width: 0px;
      }

      & hr:first-child {
        margin-top: 0px;
      }

      & hr:last-child {
        margin-top: 0px;
      }
    }

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