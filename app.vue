<script setup lang="ts">
import { SITE_TITLE, SITE_DESCRIPTION } from '@/utils/config'

useHead({
  title: SITE_TITLE,
  meta: [
    { name: "title", content: SITE_TITLE },
    { name: "description", content: SITE_DESCRIPTION }
  ],
  link: [
    { rel: "alternate", type: "application/rss+xml", href: "/index.xml" },
    { rel: "icon", type: "image/png", href: "/static/favicons/favicon.ico" },
    { rel: "icon", type: "image/png", sizes: "16x16", href: "/static/favicons/favicon-16x16.png" },
    { rel: "icon", type: "image/png", sizes: "32x32", href: "/static/favicons/favicon-32x32.png" },
  ],
  htmlAttrs: {
    lang: 'it-IT',
    'data-theme': 'corporate',
  },
})
</script>

<template>
  <Header />
  <main>
    <Container>
      <NuxtPage />
    </Container>
    <Footer />
  </main>
</template>
