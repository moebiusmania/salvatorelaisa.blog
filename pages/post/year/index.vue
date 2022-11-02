<script lang="ts" setup>
const BASE: number = 2010
const CURRENT: number = new Date().getFullYear()
const difference: number = (CURRENT - BASE) + 1
const years: Array<string> = Array.from(new Array(difference), (e, i) => BASE + i).map((e) => e.toString())
</script>

<template>
  <div
    class="flex flex-col items-start justify-start divide-y divide-gray-200 dark:divide-gray-700 md:justify-center md:items-center md:divide-y-0 md:flex-row md:space-x-6 md:mt-24">
    <div class="pt-6 pb-8 space-x-2 md:space-y-5">
      <h1
        class="text-3xl font-extrabold leading-9 tracking-tight text-base-content sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 capitalize">
        Anni
      </h1>
    </div>
    <div class="flex flex-wrap max-w-lg">
      <div v-for="year in years" class="mt-2 mb-2 mr-5">
        <NuxtLink class="mr-3 text-sm font-medium text-primary uppercase hover:primary-focus"
          :href="`/post/year/${year}`">{{ year }}</NuxtLink>
        <!-- <NuxtLink class="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
          :href="`/year/${tag.label}`">({{ tag.items }})</NuxtLink> -->
      </div>
    </div>
  </div>
</template>
