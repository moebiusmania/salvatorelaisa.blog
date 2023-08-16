<script lang="ts" setup>
import { ParsedContent } from "@nuxt/content/dist/runtime/types";

const posts: ParsedContent[] = await queryContent("/devices")
  .sort({ date: -1 })
  .find();
</script>

<template>
  <div>
    <h1
      class="text-3xl font-extrabold leading-9 tracking-tight text-base-content sm:text-4xl sm:leading-10 md:text-6xl md:leading-14"
    >
      Devices
    </h1>
    <p class="mt-4">
      Un breve riassunto dei miei vari device passati e presenti per avere una
      piccola traccia storica senza dover per forza scrivere un post dedicato
      per ognuno di questi.
    </p>
    <ul
      class="my-8 divide-y divide-primary-content grid gap-6 md:grid-cols-1 lg:grid-cols-2"
    >
      <DeviceCard v-for="post in posts" :device="post" />
    </ul>
  </div>
</template>
