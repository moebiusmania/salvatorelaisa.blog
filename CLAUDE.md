# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> A detailed companion doc lives in [AGENTS.md](AGENTS.md). This file is the quick reference; consult AGENTS.md for the full command tables and content-authoring conventions.

## What this is

Personal blog (Italian-language) built with **[Lume 3](https://lume.land/)** on **Deno**, with **Vento** templates and **Alpine.js** for client-side interactivity, exported as a **static site** to GitHub Pages. Content is Markdown. There is no npm/Node toolchain (no `package.json`, no `node_modules`): `deno.json` is the single source of truth for tasks and the import map, and npm packages (Alpine, Zod) come in through `npm:` specifiers.

The site was migrated from Nuxt. Some code comments still mention Nuxt to explain why URLs, heading slugs and reading times stay unchanged. Don't reintroduce Node tooling.

## Commands

```bash
deno task serve          # dev server with live reload, drafts hidden (serve:host to expose on the LAN)
deno task serve:drafts   # same, including draft posts
deno task build          # static build into _site/ (what CI deploys)
deno task test           # deno test -A: util, dashboard and full build tests
deno lint                # uses Lume's lint plugin (configured in deno.json)

# Run a single test file / filter
deno test -A tests/utils/books.test.ts
deno test -A --filter "spineStyle"

# Authoring
deno task new:post     # scaffold a post in content/
deno task new:device   # scaffold a device card in content/devices/
deno task new:book     # scaffold a book (draft) in content/books/
deno task dashboard    # TUI admin dashboard (scripts/dashboard/): stats + buttons that run the new:* tasks
deno task drafts       # list draft posts
deno task stats        # blog stats
deno task convert:webp <path> [--quality N]
deno task fonts:download   # fetch local font files into public/fonts/
```

`LUME_DRAFTS` controls whether drafts are rendered: `serve` sets it to `false`, `serve:drafts` sets it to `true`, and `build` never includes drafts.

## Architecture

- **Config**: `_config.ts`. Lume runs with `src: "."`, and an allowlist in `site.ignore()` limits the site to `_components/`, `_includes/`, `pages/`, `content/`, `assets/` and `public/`. Everything else (`scripts/`, `src/`, `tests/`, `docs/`) stays out of the build. `public/` is copied verbatim to the site root. `_headers` and `.nojekyll` are copied explicitly because Lume skips dotfiles and `_`-prefixed files.
- **Posts**: every `content/*.md` is a page. `content/_data.ts` sets `type: "post"`, the `layouts/post.vto` layout and the `/post/<slug>/` URL. Lume drops `draft: true` pages from the build.
- **Data-only content**: `content/devices/`, `content/books/` and `content/pages/` (about, halloween, xmas) are *not* Lume pages. `src/content.ts` (`loadCollection`, `parseMarkdown`) loads them, and `_config.ts` exposes them as site data (`devices` sorted by purchase date with the newest first, `books`, `contentPages`), with bodies rendered through the `md` filter. Files starting with `-` or marked `draft: true` are skipped.
- **Schema**: `src/content-schema.ts` (Zod). It validates post, device, book and page front matter at build time, and invalid front matter fails the build.
- **Site data**: `_config.ts` also registers `config`, `now`, `theme` and `utils` (template helpers from `src/helpers.ts` and `src/utils/books.ts`).
- **Reading time** is computed in a `site.preprocess` in `_config.ts`: 180 wpm over the raw file, front matter included. The same preprocess sets `metaTitle` and `og` for `<head>`.
- **Markdown plugins** (`src/markdown/`): `::timeline{items="…"}` blocks, heading `id`s matching the old Nuxt slugs, and `fetchpriority="high"` on each document's first image.
- **Templates**: layouts in `_includes/layouts/` (`base.vto` is the HTML shell, plus post, post-page, post-year and tag). Components live in `_components/` and are called as `comp.Name(...)`. Routes are in `pages/`, each with an explicit `url`, and `pages/_data.ts` sets `base.vto` as their default layout. Generators (`*.page.ts`) produce the pagination, year and tag pages, `rss.xml` and `search.json`. Seasonal pages live in `pages/events/`.
- **Client JS**: `assets/js/main.ts` (bundled by the esbuild plugin to `/assets/js/main.js`) registers the Alpine components (`themeToggle`, `backToTop`, `pwaInstallBanner`, `postSearch`, `bookshelf`, `weather`, `githubRepos`). Templates reference them with `x-data`.
- **View transitions**: native cross-document transitions (`@view-transition` in `base.vto`). `_includes/partials/view-transitions.js` sets the slide direction for pagination.
- **Site config**: `src/utils/config.ts` (title, description, `CURRENT_THEME`, seasonal events). `/now` data lives in `src/utils/now.ts`.
- **Fonts**: `fonts.config.ts` declares families; `deno task fonts:download` pulls them from Bunny Fonts into `public/fonts/`.

## Styling convention

- Vanilla CSS only, no preprocessor. Each component has a **sibling `.css` file** in `_components/`, and page styles live in `_includes/css/`.
- `assets/styles.page.ts` concatenates them into `/assets/app.css`. The seasonal decorations (`Clouds`, `Spooks`, `Snow`) are emitted as separate files (`/assets/clouds.css`, `spooks.css` and `snow.css`) because they style `body`, and `base.vto` links them only while their theme is active.
- Global styles (`normalize`, `spacing`, `typography`, `view-transitions`) and themes are in `public/styles/`. Each theme in `public/styles/themes/` has a CSS file, and a theme can add an optional `*.decor.css` layer (currently only `halloween.decor.css`). Switch themes via `CURRENT_THEME` in `src/utils/config.ts`.

## Testing

- `deno test` with `@std/testing/bdd` + `@std/expect` (a Jest-like API). Tests live in `tests/`: `tests/utils/` covers `src/utils/` (with `fetch` stubbed), and `tests/dashboard/` covers the TUI screen.
- `tests/build.test.ts` builds the whole site into `_site_test/` (via the `BLOG_DEST` env var read by `_config.ts`) and asserts on the output. Lume resolves `dest` against the cwd, so it must be a relative path.

## Quirks

- Pin dependency versions exactly in `deno.json` `imports` (no `^`/`~`). Keep the Lume version in `lint.plugins` in sync with the `lume/` import.
- Vento has no autoescape; use `|> escape` for untrusted text in attributes.
- CI: PRs to `main` run `deno task test` → `deno task build` (`build.yml`). Pushes to `main` do the same, download fonts if they're missing, and deploy `_site` (`deploy.yml`).
- The Spooktober workflows edit `src/utils/config.ts` and `content/spooktober-reloaded.md` with `sed`, so keep the `export const CURRENT_THEME = "…" as SeasonTheme;` line format and the `draft: true|false` front-matter line.
