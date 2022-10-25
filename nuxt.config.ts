// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ["@nuxt/content", "@nuxtjs/tailwindcss"],
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/rss.xml']
    }
  },
  content: {
    markdown: {
      anchorLinks: false,
      remarkPlugins: ['remark-reading-time'],
    },
  },
});
