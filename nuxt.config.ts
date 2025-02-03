// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },

  modules: [
    "@nuxt/content",
    "@nuxthq/studio",
    "@nuxt/image",
    "@nuxt/test-utils/module",
    "@nuxtjs/google-fonts",
  ],

  googleFonts: {
    families: {
      Lexend: [300, 400, 700, 800],
    },
  },

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
