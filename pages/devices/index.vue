<script lang="ts" setup>
import { ParsedContent } from "@nuxt/content/dist/runtime/types";

const route = useRoute();
const slug: string = route.query.slug as string;

const getAll = async (): Promise<ParsedContent[]> => {
  const posts: ParsedContent[] = await queryContent("/devices")
    .sort({ purchase: -1 })
    .find();

  return posts;
};

const getOne = async (): Promise<ParsedContent[]> => {
  const posts: ParsedContent[] = await queryContent("/devices")
    .where({ _path: `/devices/${slug}` })
    .find();

  return posts;
};

const getColumns = (slug: string): string =>
  `my-8 divide-y divide-neutral-content dark:divide-neutral grid gap-6 md:grid-cols-1 ${slug ? "" : "md:grid-cols-2 lg:grid-cols-3"
  }`;

const posts: ParsedContent[] = slug ? await getOne() : await getAll();
</script>

<template>
  <div>
    <h1
      class="text-3xl font-extrabold leading-9 tracking-tight text-base-content sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
      Devices
    </h1>
    <p class="mt-4">
      Un breve riassunto dei miei vari device passati e presenti per avere una
      piccola traccia storica senza dover per forza scrivere un post dedicato
      per ognuno di questi.
    </p>
    <p class="mt-2">
      L'ordine è cronologico sulla base del giorno o periodo in cui li ho
      comprati.
    </p>
    <ul :class="getColumns(slug)">
      <DeviceCard v-for="post in posts" :device="post" />
    </ul>
  </div>
</template>
