# salvatorelaisa.blog

Personal blog built on top of the [Nuxt](https://v3.nuxtjs.org/) framework and exported as a static website.

Hosting and Continous Deployment is based on Github Pages & Actions.

The contents are **my own personal thoughts and opinions**. Images and videos that aren't of my own or made by me are always linked/embedded from external sources.

## Built on top of

- [Nuxt 3](https://v3.nuxtjs.org/) - main application framework
  - [Vue 3](https://vuejs.org/) - UI component library
  - [@nuxt/content](https://content.nuxtjs.org/) - module to easily integrate content from `markdown` files
- [Tailwind.CSS](https://tailwindcss.com/) - utility-first CSS framework
  - [Typography](https://tailwindcss.com/docs/typography-plugin) - (plugin) typographic defaults for HTML
  - [DaisyUI](https://daisyui.com/) - components library built on top of Tailwind.css
- [remark-reading-time](https://www.npmjs.com/package/remark-reading-time) - Medium's like reading time estimation
- [rss](https://www.npmjs.com/package/rss) - utility to help create the RSS `.xml` file
- [sitemap](https://www.npmjs.com/package/sitemap) - utility to help create the sitemap `.xml` file

## Creating a new post

With an NPM script:

```bash
$ npm run new "post title"
```

or manually:

- go in the `content` folder
- clone the `_template.md` file
- edit the cloned file with your content

## Customizations

I've added some small new features over the starting Nuxt template to handle some more blog-specific functionalities

<!-- - live textual search for posts (_by title and excerpt only_) -->
- filter posts by tag
- "posts by year" page template, available at `/post/year`
- ["_Buy me a coffee_"](https://www.buymeacoffee.com/moebiusmania) tip button
- "reading time" for posts

## Can I use this to bootstrap my new Nuxt blog?

Sure you can! But this repo is not structured as a template for new projects so you will need to delete all of my content (_which is **not** free to use_) and references and add your own. It's not difficult but just a bit tedious, have fun!

## License

Code released under the [MIT](LICENSE) license.
