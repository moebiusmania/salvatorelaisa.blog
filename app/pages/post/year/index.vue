<script lang="ts" setup>
const BASE: number = 2010
const CURRENT: number = new Date().getFullYear()
const difference: number = (CURRENT - BASE) + 1
const years: Array<string> = Array.from({ length: difference }, (e, i) => BASE + i).map((e) => e.toString())
</script>

<template>
  <div>
    <div>
      <h1>Anni</h1>
    </div>
    <div>
      <div v-for="year in years">
        <NuxtLink :href="`/post/year/${year}`">{{ year }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  border-top-width: 1px;
  border-color: #E5E7EB;

  @media (min-width: 768px) {
    margin-top: var(--sp-8);
    margin-left: var(--sp-3);
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-top-width: 0;
  }

  &>div:first-child {
    padding-top: var(--sp-3);
    padding-bottom: var(--sp-4);
    margin-left: var(--sp-1);

    @media (min-width: 768px) {
      margin-top: var(--sp-3);
    }
  }

  & h1 {
    text-transform: capitalize;
  }

  &>div:last-child {
    display: flex;
    flex-wrap: wrap;
    max-width: 32rem;

    &>div {
      margin-top: var(--sp-1);
      margin-bottom: var(--sp-1);
      margin-right: var(--sp-3);
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 300ms;

      :hover {
        text-decoration: underline;
      }

      &>a:first-child {
        margin-right: var(--sp-2);
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 500;
        text-transform: uppercase;
      }

      &>a:last-child {
        margin-left: calc(var(--sp-1) * -1);
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 600;
        color: var(--text);
        text-transform: uppercase;
      }
    }
  }
}
</style>
