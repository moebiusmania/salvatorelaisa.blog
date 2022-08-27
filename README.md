# salvatorelaisa.blog

Personal blog built on top of the [Astro](https://astro.build/) static site generator.

Hosting and Continous Deployment is based on Github Pages & Actions.

The contents are **my own personal thoughts and opinions**. Images and videos that aren't of my own or made by me are always linked/embedded from external sources.

## Creating a new post

With an NPM script:

```bash
$ npm run new "post title"
```

or manually:

- go in the `src/pages/post` folder
- clone the `_template.md` file
- edit the cloned file with your content

## Customizations

I've added some small new features over the starting Astro blog template to handle some more blog-specific functionalities

- live textual search for posts (_by title and excerpt only_)
- filter posts by tag
- "posts by year" page template, available at `/post/year/[a-year-between-2010-and-current]`
- ["_Buy me a coffee_"](https://www.buymeacoffee.com/moebiusmania) tip button
- "reading time" for posts

## Can I use this to bootstrap my new Astro blog?

Sure you can! But this repo is not structured as a template for new projects so you will need to delete all of my content (_which is **not** free to use_) and references and add your own. It's not difficult but just a bit tedious, have fun!

## License

Code released under the [MIT](LICENSE) license.
