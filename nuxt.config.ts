// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },

  modules: ["@nuxt/content", "@nuxthq/studio", "@nuxt/image"],

  experimental: {
    componentIslands: true,
  },

  nitro: {
    prerender: {
      routes: ["/sitemap.xml", "/rss.xml"],
    },
  },

  content: {
    markdown: {
      anchorLinks: false,
      remarkPlugins: ["remark-reading-time"],
    },
  },

  compatibilityDate: "2024-08-20",
});