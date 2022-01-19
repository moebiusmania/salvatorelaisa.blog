# salvatorelaisa.blog

Personal blog built on top of the static site generator [Next.js](https://nextjs.org/) and the [
tailwind-nextjs-starter-blog
](https://github.com/timlrx/tailwind-nextjs-starter-blog) template.

Hosting and Continous Deployment is based on Github Pages & Actions.

The contents are personal thoughts and opinions. Images and videos that aren't of my own or made by me are always linked/embedded from external sources.

## Creating a new post

With an NPM script:

```bash
$ npm run new "post title"
```

or manually:

- go in the `data/post` folder
- clone the `_template.md` file
- edit the cloned file with your content

## Added features

I've added some small new features over the starting template to handle some more blog-specific funcionalities

- code ported to be compliant with node.js **v17+** (_especially ES Modules_)
- "posts by year" page template, available at `/post/year/[a-year-between-2010-and-current]`

## License

Code released under the [MIT](LICENSE) license.
