export default defineNuxtConfig({
  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },

  modules: [
    "@nuxt/content",
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
    renderer: {
      anchorLinks: false,
    },
  },

  compatibilityDate: "2024-08-20",
});
