# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> A detailed companion doc lives in [AGENTS.md](AGENTS.md). This file is the quick reference; consult AGENTS.md for the full command tables and content-authoring conventions.

## What this is

Personal blog (Italian-language) built with **[Lume 3](https://lume.land/)** on **Deno**, with **Vento** templates and **Alpine.js** for client-side interactivity, exported as a **static site** to GitHub Pages. Content is Markdown. There is no npm/Node toolchain: `deno.json` is the single source of truth for tasks and dependencies.

## Commands

```bash
deno task serve      # dev server with live reload (serve:host to expose on the LAN)
deno task build      # static build into _site/ (what CI deploys)
deno task test       # deno test: util unit tests + a full build test

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

deno task serve:drafts   # same, including draft posts (Lume serve shows drafts unless LUME_DRAFTS=false)
```

## Architecture

- **Config**: `_config.ts`. Lume runs with `src: "."`, and an allowlist in `site.ignore()` limits the site to `_components/`, `_includes/`, `pages/`, `content/`, `assets/` and `public/`. `public/` is copied verbatim to the site root.
- **Posts**: every `content/*.md` is a page. `content/_data.ts` sets `type: "post"`, the `layouts/post.vto` layout and the `/post/<slug>/` URL. Lume drops `draft: true` pages from the build.
- **Data-only content**: `content/devices/`, `content/books/` and `content/pages/` (about, halloween, xmas) are *not* Lume pages. `src/content.ts` loads them and they are exposed as site data (`devices`, `books`, `contentPages`), with bodies rendered through the `md` filter. Files starting with `-` or marked `draft: true` are skipped.
- **Schema**: `src/content-schema.ts` (Zod). It validates post, device, book and page front matter at build time, and invalid front matter fails the build.
- **Reading time** is computed in a `site.preprocess` in `_config.ts`: 180 wpm over the raw file.
- **Markdown plugins** (`src/markdown/`): `::timeline{items="…"}` blocks, heading `id`s matching the old Nuxt slugs, and `fetchpriority="high"` on each document's first image.
- **Templates**: layouts in `_includes/layouts/` (`base.vto` is the HTML shell, plus post, post-page, post-year and tag). Components live in `_components/` and are called as `comp.Name(...)`. Routes are in `pages/`, each with an explicit `url`, and generators (`*.page.ts`) produce the pagination, year and tag pages, `rss.xml` and `search.json`.
- **Client JS**: `assets/js/main.ts` (bundled by the esbuild plugin) registers the Alpine components (`themeToggle`, `backToTop`, `pwaInstallBanner`, `postSearch`, `bookshelf`, `weather`, `githubRepos`). Templates reference them with `x-data`.
- **View transitions**: native cross-document transitions (`@view-transition` in `base.vto`). `_includes/partials/view-transitions.js` sets the slide direction for pagination.
- **Site config**: `src/utils/config.ts` (title, description, `CURRENT_THEME`, seasonal events). `/now` data lives in `src/utils/now.ts`.
- **Fonts**: `fonts.config.ts` declares families; `deno task fonts:download` pulls them from Bunny Fonts into `public/fonts/`.

## Styling convention

- Vanilla CSS only, no preprocessor. Each component has a **sibling `.css` file** in `_components/`, and page styles live in `_includes/css/`.
- `assets/styles.page.ts` concatenates them into `/assets/app.css`. The seasonal decorations (`Clouds`, `Spooks`, `Snow`) are emitted as separate files because they style `body`, and `base.vto` links them only while their theme is active.
- Themes live in `public/styles/themes`; switch via `CURRENT_THEME` in `src/utils/config.ts`.

## Testing

- `deno test` with `@std/testing/bdd` + `@std/expect` (a Jest-like API). Tests live in `tests/`.
- `tests/build.test.ts` builds the whole site into `_site_test/` (via the `BLOG_DEST` env var read by `_config.ts`) and asserts on the output. Lume resolves `dest` against the cwd, so it must be a relative path.

## Quirks

- Pin dependency versions exactly in `deno.json` `imports` (no `^`/`~`).
- Vento has no autoescape; use `|> escape` for untrusted text in attributes.
- CI on `main`: `deno task test` → `deno task build` → deploy `_site`. The Spooktober workflows edit `src/utils/config.ts` with `sed`, so keep the `export const CURRENT_THEME = "…" as SeasonTheme;` line format.
