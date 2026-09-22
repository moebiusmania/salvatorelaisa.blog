# AGENTS.md — salvatorelaisa.blog

## Project overview

Personal blog built with **[Lume 3](https://lume.land/)** on **Deno**, exported as a **static site** to GitHub Pages.
Templates use **Vento**, client-side interactivity uses **Alpine.js**, and content is authored in Markdown.

## Tooling model

Everything runs on **Deno**. There is no `package.json` and no `node_modules`. `deno.json` holds all tasks and the import map; npm packages (Alpine, Zod) are pulled through `npm:` specifiers.

## Developer commands

### Site lifecycle

| Command | Description |
|---|---|
| `deno task serve` | Dev server with live reload |
| `deno task serve:host` | Same, listening on all interfaces |
| `deno task build` | Static build into `_site/` |
| `deno task test` | Unit tests + full build test |
| `deno task serve:drafts` | Dev server including draft posts |

### Content and utility scripts

| Command | Description |
|---|---|
| `deno task new:post` | Scaffold a new post in `content/` |
| `deno task new:device` | Scaffold a new device card in `content/devices/` |
| `deno task stats` | Print blog stats |
| `deno task drafts` | List draft posts |
| `deno task convert:webp <path> [--quality N]` | Convert PNG/JPG to WebP |
| `deno task fonts:download` | Download the fonts declared in `fonts.config.ts` |
| `deno task todo:init` | Initialize todo metadata |
| `deno task todo:list` | List todo items |
| `deno task todo:add -- "<text>"` | Add todo item |
| `deno task todo:remove -- <id>` | Remove todo item |
| `deno task todo:done -- <id>` | Mark todo item done |

## CI pipeline order

PR checks and the deploy on `main` both run:
`deno task test` → `deno task build`. The deploy then uploads `_site/` to GitHub Pages.

The scheduled Spooktober workflows toggle `CURRENT_THEME` in `src/utils/config.ts` (and publish a post) with `sed`, run the tests, commit and dispatch a deploy.

## Testing

- Runner: `deno test` with `@std/testing/bdd` and `@std/expect`.
- `tests/utils/`: unit tests for `src/utils/` (`fetch` is stubbed with `@std/testing/mock`).
- `tests/build.test.ts`: builds the site into `_site_test/` (set through `BLOG_DEST`) and checks routes, drafts, the home page, the feed, the search index and the seasonal header.

## Architecture

- **Config**: `_config.ts` (Lume site, plugins, ignore allowlist, data, preprocessors).
- **Routes**: `pages/` (each page sets its own `url`); generators in `pages/**/*.page.ts` build `/post/page/<n>/`, `/post/year/<y>/`, `/tags/<tag>/`, `/rss.xml` and `/search.json`.
- **Layouts**: `_includes/layouts/` (`base.vto` shell → `post.vto`, `post-page.vto`, `post-year.vto`, `tag.vto`).
- **Components**: `_components/*.vto` (called as `comp.Name({...})`), including `now/`, `content/` (seasonal decorations) and `icons/`.
- **Content**:
  - `content/*.md`: posts, served at `/post/<slug>/` (see `content/_data.ts`).
  - `content/pages/`: about, halloween and xmas page bodies (data only).
  - `content/devices/`: device cards (data only).
  - `content/books/`: bookshelf entries (data only).
- **Loaders and schema**: `src/content.ts` reads the data-only collections, and `src/content-schema.ts` validates all front matter with Zod.
- **Markdown**: `src/markdown/` holds the markdown-it plugins (timeline block, heading ids, first-image priority).
- **Client**: `assets/js/main.ts` holds the Alpine components, bundled to `/assets/js/main.js`.
- **Site config**: `src/utils/config.ts` (title, description, theme, events).
- **Styling pattern**:
  - Each component has a sibling CSS file (`Component.vto` + `Component.css`); page styles are in `_includes/css/`.
  - `assets/styles.page.ts` bundles them into `/assets/app.css`, with separate files for the seasonal decorations.
  - No CSS preprocessor.

## Content authoring

- New posts default to `draft: true`; set it to `false` to publish.
- Pinned posts use `pinned: true` in the front matter.
- Reading time is computed at build time (180 wpm over the raw file).
- Device cards in `content/devices/` use `title`, `purchase`, `tags`, `image`, and optionally `url` and `post`.
- Hide a device or book by prefixing its filename with `-` or setting `draft: true`.
- Timelines inside posts: `::timeline{items="2013 - one, 2015 - two"}` followed by a closing `::` line.
