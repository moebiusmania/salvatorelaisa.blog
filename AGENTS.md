# AGENTS.md — salvatorelaisa.blog

## Project overview

Personal blog built with **Nuxt 4** (Vue 3), exported as a **static site** to GitHub Pages. Content is written in Markdown and managed via `@nuxt/content` v3 with SQLite-backed storage (in dev) or memory (in test).

## Developer commands

| Command | Description |
|---|---|
| `npm run dev` | Starts dev server (auto-runs `npm run format` via `predev`) |
| `npm run generate` | Static site build for deployment |
| `npm run lint` | Run oxlint (no auto-fix) |
| `npm run lint:fix` | Run oxlint with auto-fix |
| `npm run format` | Run Biome formatter (writes in place, no config file — uses defaults) |
| `npm test` | Run Vitest in watch mode |
| `npm run test:coverage` | Run Vitest with coverage |
| `npm run new:post` | Scaffold a new blog post (creates draft in `content/`) |
| `npm run new:device` | Scaffold a new device card |
| `npm run stats` | Print blog stats to terminal |
| `npm run drafts` | List draft posts |
| `npm run convert:webp <path>` | Convert PNG/JPG to WebP (supports `--quality N` flag) |

## CI pipeline order

PR builds on `main` run: `npm ci` → `npm run lint` → `npm run test` → `npm run generate`.
Deploy workflow uses `npm i --legacy-peer-deps` (not `npm ci`) and requires `NUXT_PUBLIC_STUDIO_TOKENS` in `.env`.

## Testing

- Tests use **Vitest** with `@nuxt/test-utils`, env set to `"nuxt"`, globals enabled.
- Test files: `**/*.test.ts` (no `.spec.ts` used).
- **Critical**: `vitest.setup.ts` forces `NUXT_CONTENT_CACHE=false` and `NUXT_CONTENT_STORAGE=memory` to prevent SQLite corruption during tests. `nuxt.config.ts` mirrors this via `process.env.NODE_ENV === "test"`.
- Tests live in `app/components/__tests__/` and `app/utils/__tests__/`.
- Many component tests use `.server.test.ts` suffix for server-side components.

## Architecture

- **App entry**: `app/app.vue` — handles theme switching, global head config.
- **Pages**: `app/pages/` — file-based routing (`index.vue`, `post/`, `devices/`, `tags/`, `events/`).
- **Content**: `content/` — blog posts as `.md` files with frontmatter. `content/pages/` for static pages. `content/devices/` for device cards.
- **Content schema**: defined in `content.config.ts` — two collections: `content` (posts) and `devices`. Frontmatter must include `title`, `date`, `tags`, `pinned`, `draft`, `readingTime`, and `meta: { images, summary }`.
- **Config**: `app/utils/config.ts` — site title, description, current theme, events.
- **Themes**: CSS files in `public/styles/themes/`. Change `CURRENT_THEME` in config to switch.
- **Styling**: each component has a sibling `.css` file (e.g., `Header.vue` / `Header.css`). Styles are class-scoped (e.g., `.header`, `.footer`) via root classes on the outermost element. Vue `<style>` blocks only contain `@import`. No CSS preprocessor. `Badge.css` and `slide-animations.css` are shared imports.

## Key quirks

- `npm run dev` auto-runs Biome format via `predev` hook — expect formatting on every dev start.
- `@nuxt/content` v3 uses SQLite for content indexing by default. `.data/content/contents.sqlite` is git-ignored.
- `npm install` triggers `nuxt prepare` via `postinstall` (generates `.nuxt/` types).
- Biome has **no config file** — uses defaults. Only used for formatting, not linting (oxlint handles linting).
- `.npmrc` sets `save-exact=true` — no `^` or `~` prefixes on new deps.
- Nuxt compatibility version is set to **5** (`future.compatibilityVersion: 5` in `nuxt.config.ts`).

## Content authoring

- New posts start as `draft: true` — set to `false` to publish.
- Pinned posts: add `pinned: true` in frontmatter.
- Reading time is auto-computed via `content:file:afterParse` hook (180 wpm).
- Device cards go in `content/devices/` with schema: `title`, `purchase`, `tags`, `image`, optional `url` and `post`.
