# salvatorelaisa.blog

Personal blog built on top of the [Nuxt](https://nuxt.com/) framework and exported as a static website.

Hosting and Continous Deployment is based on Github Pages & Actions.

The contents are **my own personal thoughts and opinions**. Images and videos that aren't of my own or made by me are always linked/embedded from external sources.

## Built on top of

- [Nuxt 3](https://nuxt.com/) - main application framework based on [Vue 3](https://vuejs.org/)
  - [@nuxt/content](https://content.nuxtjs.org/) - module to easily integrate content from `markdown` files
  - [@nuxt/google-fonts](https://google-fonts.nuxtjs.org/) - module to easily integrate Google Fonts
  - [@nuxt/studio](https://nuxt.studio/) - module to enable the integration with the Nuxt Studio editing UI
- [vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) - every style has been written using regular CSS syntax, leveraging [Vue's CSS Module](https://vuejs.org/api/sfc-css-features.html#css-modules) support
- [remark-reading-time](https://www.npmjs.com/package/remark-reading-time) - Medium's like reading time estimation
- [rss](https://www.npmjs.com/package/rss) - utility to help create the RSS `.xml` file
- [sitemap](https://www.npmjs.com/package/sitemap) - utility to help create the sitemap `.xml` file

I'm also integrating with [Nuxt Studio](https://nuxt.studio/) to play a bit with **visual editing**, which comes pretty handy when editing/writing content from devices like the iPad Mini.

## Creating a new post

With an NPM script:

```bash
$ npm run new:post "post title"
```

or manually:

- go in the `content` folder
- clone the `_template.md` file
- edit the cloned file with your content

you can also create a new "device card" for the related page with:

```bash
$ npm run new:device "device name"
```

## Customizations

I've added some small new features over the starting Nuxt template to handle some more blog-specific functionalities

- light/dark mode switcher (_client side_)
- live textual search for posts (_by title only_)
- pinned posts (_just add `pinned: true` in the frontmatter_)
- "comments" to post through [Threads](https://www.threads.net/) or check the source markdown file on Github
- filter posts by tag
- "posts by year" page template, available at `/post/year`
- ["_Buy me a coffee_"](https://www.buymeacoffee.com/moebiusmania) tip button
- "reading time" for posts
- "old post warning" for 2+ years old content
- "personal devices timeline" section
- CSS themes support (_at the moment only an "xmas" one is included_)
- basic CLI stats (_total posts, drafts, device cards_)

## CLI stats

Very basic stats can be generated on the terminal using

```bash
$ npm run stats
```

it will output a table like this

```bash
📊 Blog quick stats
┌─────────┬─────────────────────────┬───────┐
│ (index) │ Category                │ Count │
├─────────┼─────────────────────────┼───────┤
│ 0       │ '📄 Posts'              │  2    │
│ 1       │ '📝 Drafts'             │  1    │
│ 2       │ '📱 Device Cards'       │  2    │
│ 3       │ '📝 Device Card Drafts' │  1    │
└─────────┴─────────────────────────┴───────┘
```

## Can I use this to bootstrap my new Nuxt blog?

Sure you can! But this repo is not structured as a template for new projects so you will need to delete all of my content (_which is **not** free to use_) and references and add your own. It's not difficult but just a bit tedious, have fun!

## License

Code released under the [MIT](LICENSE) license.
