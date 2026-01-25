# salvatorelaisa.blog

Personal blog built on top of the [Nuxt](https://nuxt.com/) framework and exported as a static website.

Hosting and Continous Deployment is based on Github Pages & Actions.

The contents are **my own personal thoughts and opinions**. Images and videos that aren't of my own or made by me are always linked/embedded from external sources.

## 🛠️ Built on top of

- [Nuxt 3](https://nuxt.com/) - main application framework based on [Vue 3](https://vuejs.org/)
  - [@nuxt/content](https://content.nuxtjs.org/) - module to easily integrate content from `markdown` files
  - [@nuxt/fonts](https://nuxt.com/modules/fonts) - module to easily integrate external fonts from [Bunny Fonts 🇪🇺](https://fonts.bunny.net/)
- [vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) - every style has been written using regular CSS syntax, leveraging [Vue's CSS Module](https://vuejs.org/api/sfc-css-features.html#css-modules) support

I'm also integrating with [Nuxt Studio](https://nuxt.studio/) to play a bit with **visual editing**, which comes pretty handy when editing/writing content from devices like the iPad Mini.

## ⚙️ Customizations

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

## 💻 CLI commands

Besides the typical dev scripts (_mostly inherited from Nuxt_) I've added some custom scripts to better manage the blog through terminal:

| Command                             | Description                     |
| ----------------------------------- | ------------------------------- |
| `npm run new:post`                  | Create new blog post            |
| `npm run new:device`                | Create new device card          |
| `npm run stats`                     | Generate simple blog statistics |
| `npm run drafts`                    | List draft posts                |
| `npm run convert:webp path/to/file` | Convert images to `.webp`       |

## ✅ Built-in todo utility

I've added an internal file-based todo list utility, it can be useful if you need to keep some notes within the project. The list is stored and read from a `todo.md` file. **This is a very simple solution**, with no interest in replacing full fledged todo app.

You can create and edit the file manually, but there are some small NPM scripts that can help to manage it:

| Command                         | Description                                |
| ------------------------------- | ------------------------------------------ |
| `npm run todo:init`             | Create the `todo.md` file                  |
| `npm run todo:list`             | As it says, print the list on the terminal |
| `npm run todo:add -- "content"` | Add "content" to the todo list             |
| `npm run todo:done -- 1`        | Set todo item with provided index as done  |
| `npm run todo:remove -- 1`      | Remove todo item based on provided index   |

> **Note:** the `todo.md` file **is git-ignored by default** so if you want it to be synced on every cloned copy of the repo you will have to remove it from the the `.gitignore`, but remember that in case of a public repository the file will be visible to anyone.

## 🖼️ Converting images to .webp

To achieve better page loading performance, you should [use as much as possible formats like the `.webp`](https://developer.chrome.com/docs/lighthouse/performance/uses-webp-images).

For this reason I've included a simple converter script based on [sharp](https://sharp.pixelplumbing.com/) that can convert a single file or a whote folder of `.png`, `.jpg`/`.jpeg` files and convert them to `.webp` format, making it very easy to do some optimizations.

```bash
npm run convert:webp path/to/file-or-folder
```

the default `.webp` quality is set to `90`, but you can change this using an optional flag

```bash
npm run convert:webp path/to/file-or-folder -- --quality 100
```

## How to change theme

It's easier as changing a line in the `/utils/config.ts`, however you need a CSS theme file with the same name in `/public/styles/themes`.

If you wante to create a new theme you can just copy and rename one of the existing files and change the values of the CSS variables in it.

## 👀 Can I use this to bootstrap my new Nuxt blog?

Sure you can! But this repo is not structured as a template for new projects so you will need to delete all of my content (_which is **not** free to use_) and references and add your own. It's not difficult but just a bit tedious, have fun!

## 📄 License

Code released under the [MIT](LICENSE) license.
