# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> A detailed companion doc lives in [AGENTS.md](AGENTS.md). This file is the quick reference; consult AGENTS.md for the full command tables and content-authoring conventions.

## What this is

Personal blog (Italian-language) built with **[Astro](https://astro.build/)** on **[Bun](https://bun.sh/)**, exported as a **static site** to GitHub Pages. Every page is rendered by Astro at build time; **Alpine.js** handles the client-side interactivity. Content is Markdown. There is no Node, npm, Deno, Go or htmx: Bun is the runtime, package manager, test runner and script runner.

The site was migrated from Nuxt, then Lume, then Hugo. Some comments still mention them to explain why URLs, heading slugs, reading times and markup stay unchanged: the output must stay identical for visitors.

## Commands

```bash
bun install --frozen-lockfile
bun run dev              # dev server on :3000, drafts hidden
bun run dev:drafts       # including draft posts (dev:host listens on the LAN)
bun run build            # static build into _site/ (what CI deploys; never drafts)
bun run preview          # serve _site/ locally
bun test                 # unit, dashboard and full site build tests

# Run a single test file / test
bun test tests/utils/books.test.ts
bun test -t "spineStyle"

# Authoring
bun run new:post "Title" # scaffold a post in content/ (also: new:device, new:book)
bun run dashboard        # TUI admin dashboard (scripts/dashboard): stats + buttons for new:*
bun run drafts           # list draft posts
bun run stats            # blog stats
bun run convert:webp <path> [--quality N]
bun run todo list|add|done|remove|init
bun run fonts:download   # fetch the fonts in fonts.yaml into public/fonts/
```

Always go through the package scripts: they pass `bun --bun`, so Astro runs on Bun and not on a system Node.

## Architecture

- **Astro config**: `astro.config.ts`. Output goes to `_site/`, assets to `/assets/` (not `_astro/`), one page per folder (`/post/<slug>/index.html`). `public/` is copied verbatim, dotfiles included.
- **Content**: `src/content.config.ts` defines the `posts`, `pages`, `devices` and `books` collections and their zod schemas (invalid front matter fails the build). The glob loaders read the repo-level `content/` folder; `generateId` keeps the raw file names, because they end up in URLs and spine hashes. Files starting with `-` are hidden.
- **Queries**: `src/utils/posts.ts` (`getPosts`, `getTags`, `getDevices`, `getBooks`) filters drafts, sorts, and computes reading times. Pages use these, never `getCollection` directly.
- **Routes**: `src/pages/`. `post/[slug].astro`, `post/page/[page].astro` (10 per page), `post/year/`, `tags/`, `events/`; endpoints `rss.xml.ts` and `search.json.ts`.
- **Templates**: `src/layouts/Base.astro` is the HTML shell; components are in `src/components/` (`now/`, `content/` seasonal decorations, `icons/`).
- **Markdown**: the `unified()` processor (not Astro's default Sätteri) with remark plugins in `src/markdown/`: Nuxt-style heading ids (`_` before a leading digit), `fetchpriority="high"` on the first image, `::timeline{items="…"}` blocks and `<s>` for `~~strike~~`. Smart punctuation and code highlighting are off.
- **Client JS**: `src/client/main.ts` (Alpine components: `themeToggle`, `backToTop`, `pwaInstallBanner`, `postSearch`, `bookshelf`, `weather`, `githubRepos`), bundled by Astro from the `<script>` in `Base.astro`. Alpine directives (`x-data`, `@click`, `:class`) go straight in the `.astro` markup. The search fetches `/search.json` on first use.
- **Site config**: `src/utils/config.ts` (title, description, `CURRENT_THEME`, events, season emoji). `/now` data: `src/utils/now.ts`.
- **CLI**: `scripts/` (Bun TypeScript), dashboard in `scripts/dashboard/` (signals + a hand-written cell-diffing screen).
- **View transitions**: native cross-document transitions; `src/client/view-transitions.js` is inlined in `<head>` and sets the slide direction for pagination.

## Styling convention

- Vanilla CSS only, no preprocessor. Each component has a **sibling `.css` file** in `src/components/`, page styles live in `src/styles/pages/`. Don't use `<style>` blocks in `.astro` files.
- **A new stylesheet must be added to `src/styles/app.css`**, the single bundle imported by `Base.astro`. Its `@import` list has a fixed order (Badge and now/card first, then byte order), so the cascade doesn't depend on which components a page uses.
- The seasonal decorations style `body`, so they are not in the bundle: they live in `public/styles/decorations/` and `Base.astro` links them only while their theme is active.
- Global styles and themes are in `public/styles/`. Switch themes via `CURRENT_THEME` in `src/utils/config.ts`.

## Testing

- `bun test` (`bun:test`). `tests/utils/books.test.ts` pins spine hashes and styles: keep them matching.
- `tests/build.test.ts` builds the whole site into `_site_test/` and asserts on the output (routes, drafts, pagination, home pinned post, feed, search, hidden devices/books, seasonal nav, timeline, heading ids, CSS bundle).
- `tests/dashboard/` covers the terminal input parser and the screen diffing.

## Quirks

- Pin dependency versions exactly in `package.json`; the Bun version is pinned by `packageManager`, which CI reads.
- `_site_test` must stay inside the repo: Astro moves files into `outDir` with a rename, which fails across filesystems.
- Astro detects AI agents and backgrounds `astro dev` on its own, tracking it in `.astro/dev.json` (`astro dev status|logs|stop`). A later `dev` attaches to that server, so env vars like `BLOG_DRAFTS` may not apply; pass `--ignore-lock` for a one-off foreground server.
- The `.md` files are plain Markdown, not MDX. GFM autolinks bare URLs.
- CI: PRs to `main` run `bun test` → `bun run build` (`build.yml`). Pushes to `main` do the same, download fonts if missing, and deploy `_site` (`deploy.yml`).
- The Spooktober workflows edit `src/utils/config.ts` and `content/spooktober-reloaded.md` with `sed`, so keep the `export const CURRENT_THEME = "…" as SeasonTheme;` line format and the `draft: true|false` front-matter line.
