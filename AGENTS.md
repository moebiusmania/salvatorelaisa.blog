# AGENTS.md — salvatorelaisa.blog

## Project overview

Personal blog built with **Nuxt 4** (Vue 3), exported as a **static site** to GitHub Pages.
Content is authored in Markdown and managed with `@nuxt/content` v3:
- Dev/build: SQLite-backed content index.
- Tests: memory storage to avoid SQLite corruption.

## Tooling model (important)

This repo now uses a **split runtime**:
- **npm/Nuxt toolchain** for the app lifecycle (`dev`, `build`, `generate`, `preview`, `postinstall`).
- **Deno scripts** for local authoring/utilities (`scripts/*.ts`).

`deno.json` is the source of truth for Deno tasks. `package.json` mirrors those tasks as npm scripts so both entry points work.

## Developer commands

### App lifecycle (npm)

| Command | Description |
|---|---|
| `npm run dev` | Starts dev server (auto-runs `npm run format` via `predev`) |
| `npm run build` | Build Nuxt app |
| `npm run generate` | Static site build for deployment |
| `npm run preview` | Preview generated output |
| `npm run lint` | Run oxlint (no auto-fix) |
| `npm run lint:fix` | Run oxlint with auto-fix |
| `npm run format` | Run Biome formatter (writes in place) |
| `npm test` | Run Vitest in watch mode |
| `npm run test:update` | Update Vitest snapshots |
| `npm run test:coverage` | Run Vitest with coverage |

### Content and utility scripts (Deno-backed)

| Command | Description |
|---|---|
| `npm run new:post` | Scaffold a new post in `content/` |
| `npm run new:device` | Scaffold a new device card in `content/devices/` |
| `npm run stats` | Print blog stats |
| `npm run drafts` | List draft posts |
| `npm run convert:webp -- <path> [--quality N]` | Convert PNG/JPG to WebP |
| `npm run todo:init` | Initialize todo metadata |
| `npm run todo:list` | List todo items |
| `npm run todo:add -- "<text>"` | Add todo item |
| `npm run todo:remove -- <id>` | Remove todo item |
| `npm run todo:done -- <id>` | Mark todo item done |

If needed, these can also be run directly with Deno tasks (for example `deno task drafts`).

## CI pipeline order

PR checks on `main` run:
`npm ci` → `npm run lint` → `npm run test` → `npm run generate`

Deploy workflow uses `npm i --legacy-peer-deps` (not `npm ci`) and requires `NUXT_PUBLIC_STUDIO_TOKENS` in `.env`.

## Testing

- Test runner: **Vitest** with `@nuxt/test-utils` (`environment: "nuxt"`, globals enabled).
- File naming: `**/*.test.ts` (not `.spec.ts`).
- Locations: primarily `app/components/__tests__/` and `app/utils/__tests__/`.
- Many server-side component tests use `.server.test.ts`.
- **Critical**: tests must run with content cache disabled and memory storage:
  - `vitest.setup.ts` sets `NUXT_CONTENT_CACHE=false` and `NUXT_CONTENT_STORAGE=memory`.
  - `nuxt.config.ts` mirrors this for `NODE_ENV === "test"` via `content.cache = false` and `content.storage = "memory"`.

## Architecture

- **App entry**: `app/app.vue` (theme switching + global head config).
- **Routing**: file-based routes in `app/pages/` (`index.vue`, `post/`, `devices/`, `tags/`, `events/`).
- **Content**:
  - `content/` for posts.
  - `content/pages/` for static pages.
  - `content/devices/` for device cards.
- **Schema**: `content.config.ts` defines two collections (`content`, `devices`).
- **Site config**: `app/utils/config.ts` (title, description, theme, events).
- **Styling pattern**:
  - Each component has a sibling CSS file (`Component.vue` + `Component.css`).
  - Vue `<style>` blocks generally only contain `@import`.
  - No CSS preprocessor.
  - Shared styles include `Badge.css` and `slide-animations.css`.

## Key quirks

- `npm run dev` triggers `predev` → `npm run format`, so starting dev can rewrite files.
- `npm install` triggers `nuxt prepare` via `postinstall` (updates `.nuxt/` types).
- `@nuxt/content` uses SQLite indexing in non-test environments (`.data/content/contents.sqlite` is git-ignored).
- Biome is used for formatting; oxlint is used for linting.
- No custom Biome config file in repo (defaults are used).
- `.npmrc` has `save-exact=true` (no `^`/`~` prefixes on new deps).
- Nuxt future compatibility mode is set to 5 (`future.compatibilityVersion: 5`).

## Content authoring

- New posts default to `draft: true`; set to `false` to publish.
- Pinned posts use `pinned: true` in frontmatter.
- Reading time is auto-calculated in `content:file:afterParse` (180 wpm) and injected into `content.readingTime`.
- Device cards in `content/devices/` use: `title`, `purchase`, `tags`, `image`, optional `url` and `post`.
