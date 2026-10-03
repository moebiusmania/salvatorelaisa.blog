# AGENTS.md — salvatorelaisa.blog

## Project overview

Personal blog built with **[Lume 3](https://lume.land/)** on **Deno**, exported as a **static site** to GitHub Pages.
Templates use **Vento**, client-side interactivity uses **Alpine.js**, and content is authored in Markdown.

## Tooling model

Everything runs on **Deno**. There is no `package.json` and no `node_modules`. `deno.json` holds all tasks, the import map (versions pinned exactly) and the lint config (Lume's lint plugin); npm packages (Alpine, Zod) are pulled through `npm:` specifiers.

The site was migrated from Nuxt (`a195ff5`). Comments that mention Nuxt explain why URLs, heading slugs and reading times stay unchanged.

## Developer commands

### Site lifecycle

| Command | Description |
|---|---|
| `deno task serve` | Dev server with live reload (drafts hidden) |
| `deno task serve:host` | Same, listening on all interfaces |
| `deno task build` | Static build into `_site/` |
| `deno task serve:drafts` | Dev server including draft posts |
| `deno task test` | Unit, dashboard and full build tests |
| `deno lint` | Lint with the Lume plugin |

### Content and utility scripts

| Command | Description |
|---|---|
| `deno task new:post` | Scaffold a new post in `content/` |
| `deno task new:device` | Scaffold a new device card in `content/devices/` |
| `deno task new:book` | Scaffold a new book (as a draft) in `content/books/` |
| `deno task dashboard` | Mouse-driven TUI with blog stats and buttons for the `new:*` tasks |
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

PR checks (`build.yml`) and the deploy on `main` (`deploy.yml`) both run:
`deno task test` → `deno task build`. Before that, the deploy runs `fonts:download` if any family in `fonts.config.ts` has no local files. It then uploads `_site/` to GitHub Pages.

The scheduled Spooktober workflows (`spooktober-2026*.yml`) toggle `CURRENT_THEME` in `src/utils/config.ts` (and flip `draft:` in `content/spooktober-reloaded.md`) with `sed`, run the tests, commit and dispatch a deploy. Keep the `export const CURRENT_THEME = "…" as SeasonTheme;` line format.

## Testing

- Runner: `deno test` with `@std/testing/bdd` and `@std/expect`.
- `tests/utils/`: unit tests for `src/utils/` (`fetch` is stubbed with `@std/testing/mock`).
- `tests/dashboard/`: tests for the TUI dashboard screen.
- `tests/build.test.ts`: builds the site into `_site_test/` (set through `BLOG_DEST`) and checks routes, drafts, the home page, the feed, the search index and the seasonal header.

## Architecture

- **Config**: `_config.ts` (Lume site with `src: "."`, plugins, ignore allowlist, site data, preprocessors). Only `_components/`, `_includes/`, `pages/`, `content/`, `assets/` and `public/` are part of the site. `public/` is copied to the site root, including `_headers` and `.nojekyll`.
- **Routes**: `pages/` (each page sets its own `url`, and `pages/_data.ts` defaults to `base.vto`), including `pages/events/` (halloween, xmas); generators in `pages/**/*.page.ts` build `/post/page/<n>/`, `/post/year/<y>/`, `/tags/<tag>/`, `/rss.xml` and `/search.json`.
- **Layouts**: `_includes/layouts/` (`base.vto` shell → `post.vto`, `post-page.vto`, `post-year.vto`, `tag.vto`).
- **Components**: `_components/*.vto` (called as `comp.Name({...})`), including `now/`, `content/` (seasonal decorations) and `icons/`.
- **Content**:
  - `content/*.md`: posts, served at `/post/<slug>/` (see `content/_data.ts`).
  - `content/pages/`: about, halloween and xmas page bodies (data only).
  - `content/devices/`: device cards (data only).
  - `content/books/`: bookshelf entries (data only).
- **Loaders and schema**: `src/content.ts` reads the data-only collections (exposed as `devices`, `books` and `contentPages`), and `src/content-schema.ts` validates all front matter with Zod. Invalid front matter fails the build.
- **Template helpers**: `src/helpers.ts` (dates, CSS vars, theme init script) and `src/utils/books.ts`, exposed as the `utils` site data.
- **Markdown**: `src/markdown/` holds the markdown-it plugins (timeline block, heading ids, first-image priority).
- **Client**: `assets/js/main.ts` holds the Alpine components, bundled to `/assets/js/main.js`.
- **Site config**: `src/utils/config.ts` (title, description, theme, events); `/now` data in `src/utils/now.ts`.
- **Scripts**: `scripts/` (scaffolders, stats, drafts, todo, fonts, WebP converter) and `scripts/dashboard/` (TUI).
- **Styling pattern**:
  - Each component has a sibling CSS file (`Component.vto` + `Component.css`); page styles are in `_includes/css/`.
  - `assets/styles.page.ts` bundles them into `/assets/app.css`, with separate files for the seasonal decorations (`clouds.css`, `spooks.css`, `snow.css`).
  - Global styles and themes live in `public/styles/`. A theme may add a `*.decor.css` layer (for example `halloween.decor.css`).
  - No CSS preprocessor.

## Content authoring

- New posts default to `draft: true`; set it to `false` to publish.
- Pinned posts use `pinned: true` in the front matter.
- Reading time is computed at build time (180 wpm over the raw file).
- Device cards in `content/devices/` use `title`, `purchase`, `tags`, `image`, and optionally `url` and `post`.
- Hide a device or book by prefixing its filename with `-` or setting `draft: true`.
- Timelines inside posts: `::timeline{items="2013 - one, 2015 - two"}` followed by a closing `::` line.
