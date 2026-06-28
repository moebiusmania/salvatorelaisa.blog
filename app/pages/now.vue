<script lang="ts" setup>
import { SITE_TITLE } from "@/utils/config";

const title = `${SITE_TITLE} - Adesso`;
const description =
	"Una fotografia del presente, ma con i dati invece che con la pellicola.";
</script>

<template>
  <section class="now-page">

    <Head>
      <Title>{{ title }}</Title>
      <Meta name="title" :content="title" />
      <Meta name="description" :content="description" />

      <!-- Open Graph / Facebook -->
      <Meta property="og:type" content="website" />
      <Meta property="og:url" content="https://salvatorelaisa.blog/now" />
      <Meta property="og:title" :content="title" />
      <Meta property="og:description" :content="description" />
      <Meta property="og:image" content="https://salvatorelaisa.blog/static/images/twitter-card.png" />

      <!-- Twitter -->
      <Meta property="twitter:card" content="summary_large_image" />
      <Meta property="twitter:url" content="https://salvatorelaisa.blog/now" />
      <Meta property="twitter:title" :content="title" />
      <Meta property="twitter:description" :content="description" />
      <Meta property="twitter:image" content="https://salvatorelaisa.blog/static/images/twitter-card.png" />
    </Head>

    <hgroup>
      <h1>Adesso</h1>
      <p>{{ description }}</p>
    </hgroup>

    <div class="now-grid">
      <NowWork class="now-grid-work" />
      <NowWeather class="now-grid-weather" />
      <NowGithub class="now-grid-github" />
      <NowWatching class="now-grid-watching" />
      <NowEvent class="now-grid-event" />
    </div>
  </section>
</template>

<style>
@import './now-page.css';
</style>
