<script lang="ts" setup>
import type { ParsedContent } from "@nuxt/content/dist/runtime/types";

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
  `divide-neutral-content dark:divide-neutral ${slug ? "" : "multi"
  }`;

const posts: ParsedContent[] = slug ? await getOne() : await getAll();
</script>

<template>
  <div>
    <h1>
      Devices
    </h1>
    <p>
      Un breve riassunto dei miei vari device passati e presenti per avere una
      piccola traccia storica senza dover per forza scrivere un post dedicato
      per ognuno di questi.
    </p>
    <p>
      L'ordine è cronologico sulla base del giorno o periodo in cui li ho
      comprati.
    </p>
    <ul :class="getColumns(slug)">
      <DeviceCard v-for="post in posts" :device="post" />
    </ul>
  </div>
</template>

<style scoped>
div {
  & h1 {
    font-size: 1.875rem;
    line-height: 2.25rem;
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 2.25rem;

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

  &>p:first-child {
    margin-top: 1rem;
  }

  &>p:last-child {
    margin-top: 0.5rem;
  }

  & ul {
    display: grid;
    margin-top: 2rem;
    margin-bottom: 2rem;
    gap: 1.5rem;
    border-top-width: 1px;

    @media (min-width: 768px) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  & ul.multi {
    @media (min-width: 768px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
}
</style>
