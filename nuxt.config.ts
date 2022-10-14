// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ["@nuxt/content", "@nuxtjs/tailwindcss"],
  content: {
    markdown: {
      toc: { depth: undefined, searchDepth: undefined },
    },
  },
});
