# AGENTS.md — salvatorelaisa.blog

## Project overview

Personal blog built with **[Astro](https://astro.build/)** on **[Bun](https://bun.sh/)**, exported as a **static site** to GitHub Pages.
Pages are rendered by Astro at build time, client-side interactivity uses **Alpine.js**, and content is authored in Markdown.

## Tooling model

Everything runs on **Bun**: runtime, package manager, test runner and script runner. There is no Node, npm, Deno, Go or htmx.

- `package.json` pins every dependency exactly, and the Bun version through `packageManager`. `bun.lock` is committed.
- The package scripts run Astro with `bun --bun`, so it uses the Bun runtime even when Node is installed.
- Alpine.js comes from npm and is bundled by Astro.

The site was migrated from Nuxt, then Lume (Deno), then Hugo. Comments that mention them explain why URLs, heading slugs, reading times and markup stay unchanged.

## Developer commands

### Site lifecycle

| Command | Description |
|---|---|
| `bun run dev` | Dev server on :3000 with live reload, listening on all interfaces (drafts hidden) |
| `bun run dev:drafts` | Dev server including draft posts |
| `bun run build` | Static build into `_site/` (never includes drafts) |
| `bun run preview` | Serve the built site locally |
| `bun test` | Unit, dashboard and full build tests |

### Content and utility commands

| Command | Description |
|---|---|
| `bun run new:post "<title>"` | Scaffold a new post in `content/` |
| `bun run new:device "<title>"` | Scaffold a new device card in `content/devices/` |
| `bun run new:book "<title>"` | Scaffold a new book (as a draft) in `content/books/` |
| `bun run dashboard` | Mouse-driven TUI with blog stats, a Now panel and buttons for `new:*` |
| `bun run stats` | Print blog stats |
| `bun run drafts` | List draft posts |
| `bun run convert:webp <path> [--quality N]` | Convert PNG/JPG to WebP |
| `bun run fonts:download` | Download the fonts declared in `fonts.yaml` |
| `bun run todo init` | Create `todo.md` from `todo.template.md` |
| `bun run todo list` | List todo items |
| `bun run todo add "<text>"` | Add todo item |
| `bun run todo remove <n>` | Remove todo item |
| `bun run todo done <n>` | Mark todo item done |

## CI pipeline order

PR checks (`build.yml`) and the deploy on `main` (`deploy.yml`) both run:
`bun install --frozen-lockfile` → `bun test` → `bun run build`. PR checks also run `bun audit --audit-level=high` before the tests, and fail on any high or critical advisory; the deploy skips it so a new advisory can't block a deploy. Before the tests, the deploy runs `bun run fonts:download` if any family in `fonts.yaml` has no local files. It then uploads `_site/` to GitHub Pages.

The scheduled Spooktober workflows (`spooktober*.yml`) toggle `CURRENT_THEME` in `src/utils/config.ts` (and flip `draft:` in `content/spooktober-reloaded.md`) with `sed`, run the tests, commit and dispatch a deploy. Keep the `export const CURRENT_THEME = "…" as SeasonTheme;` line format.

## Testing

- Runner: `bun test` (`bun:test`).
- `tests/utils/`: spine hashes and styles, theme helpers, `/now` helpers (`fetch` is mocked).
- `tests/dashboard/`: terminal input parser and screen diffing.
- `tests/build.test.ts`: builds the site into `_site_test/` and checks routes, drafts, pagination, the home page, the feed, the search index, hidden devices/books, the seasonal header, timelines, heading ids and the CSS bundle.

## Architecture

- **Config**: `astro.config.ts`. `public/` is copied verbatim (dotfiles included), output goes to `_site/`, built assets to `/assets/`.
- **Collections**: `src/content.config.ts` validates every front matter with zod; invalid front matter fails the build. `posts`, `pages`, `devices` and `books` load from `content/` with the raw file name as id.
- **Queries**: `src/utils/posts.ts` (drafts, sorting, reading times, tags).
- **Routes**: `src/pages/`, including `post/[slug].astro`, `post/page/[page].astro`, `post/year/[year].astro`, `tags/[tag].astro`, and the `rss.xml.ts` and `search.json.ts` endpoints.
- **Layout**: `src/layouts/Base.astro` (HTML shell, head meta, seasonal CSS and decorations).
- **Components**: `src/components/*.astro`, including `now/`, `content/` (seasonal decorations) and `icons/`.
- **Content**:
  - `content/*.md`: posts, served at `/post/<filename>/`.
  - `content/pages/`: about, halloween and xmas page bodies (data only).
  - `content/devices/`: device cards (data only).
  - `content/books/`: bookshelf entries (data only).
- **Markdown**: `unified()` processor with the remark plugins in `src/markdown/` (Nuxt-style heading ids, first-image priority, timeline blocks, `~~strike~~` → `<s>`).
- **Client**: `src/client/main.ts` holds the Alpine components and is bundled by Astro. The post search fetches `/search.json` and renders the results with Alpine.
- **Site config**: `src/utils/config.ts` (title, description, `CURRENT_THEME`, events); `/now` data and weather codes in `src/utils/now.ts`.
- **CLI**: `scripts/`, with the dashboard in `scripts/dashboard/`.
- **Styling pattern**:
  - Each component has a sibling CSS file in `src/components/`; page styles are in `src/styles/pages/`.
  - `src/styles/app.css` imports them all in a fixed order into a single bundle: add new files there.
  - Seasonal decorations are in `public/styles/decorations/`, linked only while their theme is active.
  - Global styles and themes live in `public/styles/`. A theme may add a `*.decor.css` layer (for example `halloween.decor.css`).
  - No CSS preprocessor, no scoped `<style>` blocks.

## Content authoring

- New posts default to `draft: true`; set it to `false` to publish.
- Pinned posts use `pinned: true` in the front matter.
- Reading time is computed at build time (180 wpm over the raw file).
- Device cards in `content/devices/` use `title`, `purchase`, `tags`, `image`, and optionally `url` and `post`.
- Hide a device or book by prefixing its filename with `-` or setting `draft: true`.
- Timelines inside posts: `::timeline{items="2013 - one, 2015 - two"}` followed by a closing `::` on the very next line.
