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
	`divide-neutral-content dark:divide-neutral ${slug ? "" : "multi"}`;

const posts: DevicesCollectionItem[] = slug ? await getOne() : await getAll();
</script>

<template>
  <div class="devices-page">
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

<style>
@import './devices-page.css';
</style>
