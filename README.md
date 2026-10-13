# salvatorelaisa.blog

Personal blog built with [Hugo](https://gohugo.io/) and a small [Go](https://go.dev/) toolbox, and exported as a static website.

Hosting and Continous Deployment is based on Github Pages & Actions.

The contents are **my own personal thoughts and opinions**. Images and videos that aren't of my own or made by me are always linked/embedded from external sources.

## 🛠️ Built on top of

The whole project runs on **Go** only: no `package.json`, no `node_modules`, no JS toolchain.

- [Hugo](https://gohugo.io/) - static site generator, turning the `markdown` content into pages (pinned in `tools/hugo/go.mod`)
- [Go](https://go.dev/) - the `blog` CLI: build/serve wrapper, content scaffolding, stats and a TUI dashboard ([Bubble Tea](https://github.com/charmbracelet/bubbletea))
- [Alpine.js](https://alpinejs.dev/) - the few interactive bits (theme switcher, search, books, `/now` widgets…)
- [htmx](https://htmx.org/) - loads the pre-rendered post list for the search
- [vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) - every style has been written using regular CSS syntax, one file per component
- self-hosted fonts from [Bunny Fonts 🇪🇺](https://fonts.bunny.net/) (`blog fonts download`)

## ⚙️ Customizations

I've added some small new features on top of Hugo to handle some more blog-specific functionalities

- light/dark mode switcher (_client side_)
- live textual search for posts (_by title only_)
- pinned posts (_just add `pinned: true` in the frontmatter_)
- "comments" to post through [Bluesky](https://bsky.app/) or check the source markdown file on Github
- filter posts by tag
- "posts by year" page template, available at `/post/year`
- ["_Buy me a coffee_"](https://www.buymeacoffee.com/moebiusmania) tip button
- "reading time" for posts
- "old post warning" for 2+ years old content
- "personal devices timeline" section
- CSS themes support (_at the moment only an "xmas" one is included_)
- basic CLI stats (_total posts, drafts, device cards_)
- RSS feed generated as `rss.xml` during the static build

## 💻 CLI commands

Every command is part of the `blog` CLI: run it with `go run ./cmd/blog <command>`, or build it once with `go build -o blog ./cmd/blog`.

| Command                      | Description                                      |
| ---------------------------- | ------------------------------------------------ |
| `blog serve`                 | Start the dev server with live reload (`:3000`)  |
| `blog build`                 | Build the static website into `_site/`           |
| `go test ./...`              | Run the tests                                    |
| `blog new post "Title"`      | Create new blog post                             |
| `blog new device "Title"`    | Create new device card                           |
| `blog new book "Title"`      | Create new book                                  |
| `blog dashboard`             | Admin dashboard in the terminal                  |
| `blog stats`                 | Generate simple blog statistics                  |
| `blog drafts`                | List draft posts                                 |
| `blog webp path/to/file`     | Convert images to `.webp`                        |
| `blog fonts download`        | Download the self-hosted fonts                   |

Draft posts are hidden by `serve` too; preview them locally with `blog serve --drafts`.

## ✅ Built-in todo utility

I've added an internal file-based todo list utility, it can be useful if you need to keep some notes within the project. The list is stored and read from a `todo.md` file. **This is a very simple solution**, with no interest in replacing full fledged todo app.

You can create and edit the file manually, but there are some small commands that can help to manage it:

| Command                   | Description                                  |
| ------------------------- | -------------------------------------------- |
| `blog todo init`          | Create the `todo.md` file                    |
| `blog todo list`          | Print the todo list in the terminal          |
| `blog todo add "content"` | Add "content" to the todo list               |
| `blog todo done 1`        | Mark the todo item with the given index done |
| `blog todo remove 1`      | Remove the todo item with the given index    |

> **Note:** the `todo.md` file **is git-ignored by default** so if you want it to be synced on every cloned copy of the repo you will have to remove it from the the `.gitignore`, but remember that in case of a public repository the file will be visible to anyone.

## 🖼️ Converting images to .webp

To achieve better page loading performance, you should [use as much as possible formats like the `.webp`](https://developer.chrome.com/docs/lighthouse/performance/uses-webp-images).

For this reason I've included a simple converter (pure Go, using a WebAssembly build of [libwebp](https://developers.google.com/speed/webp)) that can convert a single file or a whote folder of `.png`, `.jpg`/`.jpeg` files and convert them to `.webp` format, making it very easy to do some optimizations.

```bash
blog webp path/to/file-or-folder
```

the default `.webp` quality is set to `90`, but you can change this using an optional flag

```bash
blog webp path/to/file-or-folder --quality 100
```

## 📡 RSS feed

The blog exposes an RSS feed at `/rss.xml`, with the newest 20 published posts (drafts excluded). It's generated by `layouts/home.rss.xml` as part of every build, so `blog build` always ships an up-to-date feed.

## How to change theme

It's easier as changing the `currentTheme` line in `hugo.toml`, however you need a CSS theme file with the same name in `/public/styles/themes`.

If you wante to create a new theme you can just copy and rename one of the existing files and change the values of the CSS variables in it.

## 👀 Can I use this to bootstrap my new Hugo blog?

Sure you can! But this repo is not structured as a template for new projects so you will need to delete all of my content (_which is **not** free to use_) and references and add your own. It's not difficult but just a bit tedious, have fun!

## 📄 License

Code released under the [MIT](LICENSE) license.
