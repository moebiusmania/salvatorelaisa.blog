<script lang="ts" setup>
import type { DevicesCollectionItem } from "@nuxt/content";

const route = useRoute();
const slug: string = route.query.slug as string;

const getAll = async (): Promise<DevicesCollectionItem[]> => {
  return await queryCollection("devices")
    .where("draft", "IS NULL")
    .order("purchase", "DESC")
    .all();
};

const getOne = async (): Promise<DevicesCollectionItem[]> => {
  return await queryCollection("devices")
    .where("path", "=", `/devices/${slug}`)
    .all();
};

const getColumns = (slug: string): string =>
  `divide-neutral-content dark:divide-neutral ${slug ? "" : "multi"
  }`;

const posts: DevicesCollectionItem[] = slug ? await getOne() : await getAll();
</script>

<template>
  <div>
    <h1>Devices</h1>
    <p>
      Un breve riassunto dei miei vari device passati e presenti per avere una
      piccola traccia storica senza dover per forza scrivere un post dedicato
      per ognuno di questi.
    </p>
    <p>
      L'ordine è cronologico sulla base del giorno o periodo in cui li ho
      comprati, ma non di tutti mi ricordo la data esatta...
    </p>
    <ul :class="getColumns(slug)">
      <DeviceCard v-for="post in posts" :device="post" />
    </ul>
  </div>
</template>

<style scoped>
div {
  &>h1 {
    color: var(--text-base-content);
  }

  &>p {
    margin-top: var(--sp-2);
    line-height: 1.50em;
  }

  &>ul {
    display: grid;
    margin: var(--sp-3) 0;
    padding: 0;
    gap: var(--sp-3);
    border-top-width: 0px;

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
