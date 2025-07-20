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

  content: {
    renderer: {
      anchorLinks: false,
    },
  },

  compatibilityDate: "2024-08-20",

  hooks: {
    "content:file:afterParse"(ctx) {
      const { file, content } = ctx;

      const wordsPerMinute = 180;
      const text = typeof file.body === "string" ? file.body : "";
      const wordCount = text.split(/\s+/).length;

      content.readingTime = Math.ceil(wordCount / wordsPerMinute);
    },
  },
});
