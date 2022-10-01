<script setup lang="ts">
// Import the global.css file here so that it is included on
// all pages through the use of the <BaseHead /> component.
import '../styles/global.css'

export interface Props {
  title: string
  description: string
  image?: string
  generator: string
  url: URL
}

const {
  title,
  description,
  image = '/static/images/twitter-card.png',
  generator,
  url,
} = defineProps<Props>()

const getURL = (image: string, url: URL): string | undefined => {
  const result: URL = new URL(image, url.href)
  return image ? result.href : undefined
}
</script>

<template>
  <!-- Global Metadata -->
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="generator" :content="generator" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" :href="url.href" />

  <!-- Favicons -->
  <link rel="icon" type="image/png" href="/static/favicons/favicon.ico" />
  <link rel="icon" type="image/png" sizes="16x16" href="/static/favicons/favicon-16x16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/static/favicons/favicon-32x32.png" />
  <link rel="apple-touch-icon" sizes="76x76" href="/static/favicons/apple-touch-icon.png" />
  <link rel="mask-icon" href="/static/favicons/safari-pinned-tab.svg" color="#5bbad5" />

  <!-- RSS -->
  <link rel="alternate" type="application/rss+xml" href="/index.xml" />

  <!-- Primary Meta Tags -->
  <title>{{ title }}</title>
  <meta name="title" :content="title" />
  <meta name="description" :content="description" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" :content="url" />
  <meta property="og:title" :content="title" />
  <meta property="og:description" :content="description" />
  <meta property="og:image" :content="getURL(image, url)" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" :content="url" />
  <meta property="twitter:title" :content="title" />
  <meta property="twitter:description" :content="description" />
  <meta property="twitter:image" :content="getURL(image, url)" />
</template>
