<script lang="ts" setup>
const BASE: number = 2010
const CURRENT: number = new Date().getFullYear()
const difference: number = (CURRENT - BASE) + 1
const years: Array<string> = Array.from(new Array(difference), (e, i) => BASE + i).map((e) => e.toString())
</script>

<template>
  <div class="dark:divide-gray-700">
    <div>
      <h1>Anni</h1>
    </div>
    <div>
      <div v-for="year in years">
        <NuxtLink class="text-primary hover:primary" :href="`/post/year/${year}`">{{
          year }}</NuxtLink>
        <!-- <NuxtLink class="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
          :href="`/year/${tag.label}`">({{ tag.items }})</NuxtLink> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  border-top-width: 1px;
  border-color: #E5E7EB;

  @media (min-width: 768px) {
    margin-top: 6rem;
    margin-left: 1.5rem;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-top-width: 0;
  }

  & div:first-child {
    padding-top: 1.5rem;
    padding-bottom: 2rem;
    margin-left: 0.5rem;

    @media (min-width: 768px) {
      margin-top: 1.25rem;
    }

    & h1 {
      font-size: 1.875rem;
      line-height: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      line-height: 2.25rem;
      text-transform: capitalize;

      @media (min-width: 640px) {
        font-size: 2.25rem;
        line-height: 2.5rem;
        line-height: 2.5rem;
      }

      @media (min-width: 768px) {
        font-size: 3.75rem;
        line-height: 1;
      }
    }
  }

  & div:last-child {
    display: flex;
    flex-wrap: wrap;
    max-width: 32rem;

    & div {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      margin-right: 1.25rem;

      & a {
        margin-right: 0.75rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 500;
        text-transform: uppercase;
      }
    }
  }
}
</style>
