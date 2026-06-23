# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> A detailed companion doc lives in [AGENTS.md](AGENTS.md). This file is the quick reference; consult AGENTS.md for the full command tables and content-authoring conventions.

## What this is

Personal blog (Italian-language) built with **Nuxt 4** (Vue 3) and **@nuxt/content v3**, exported as a **static site** to GitHub Pages. Content is Markdown.

## Split runtime (important)

Two toolchains coexist:

- **npm / Nuxt** drives the app lifecycle (`dev`, `build`, `generate`, `preview`, `postinstall`).
- **Deno** drives local authoring/utility scripts in `scripts/*.ts`. `deno.json` is the source of truth for these tasks; `package.json` mirrors them as npm scripts so either entry point works.

## Commands

```bash
npm run dev          # dev server
npm run generate     # static build for deployment (what CI runs)
npm run preview      # preview generated output
npm test             # Vitest in watch mode
npm run test:coverage

# Run a single test file / filter (Vitest)
npx vitest run app/utils/__tests__/index.test.ts
npx vitest run -t "name of test"

# Authoring (Deno-backed, also work as `deno task ...`)
npm run new:post     # scaffold a post in content/
npm run new:device   # scaffold a device card in content/devices/
npm run drafts       # list draft posts
npm run stats        # blog stats
npm run convert:webp -- <path> [--quality N]
npm run fonts:download   # fetch local font files into public/fonts/
```

## Architecture

- **Entry**: `app/app.vue` (theme switching + global head). `app/router.options.ts` and `app/plugins/view-transitions.client.ts` handle routing/transitions — page transitions use the **native View Transitions API**, not Vue transitions (`app.pageTransition` is `false` in `nuxt.config.ts`).
- **Routing**: file-based in `app/pages/` (`index`, `post/`, `post/page/[page]`, `post/year/[year]`, `tags/`, `devices/`, `events/`).
- **Content collections** (`content.config.ts`): `content` (all `**/*.md`) and `devices` (`**/devices/*.md`), each with a Zod schema. Posts default to `draft: true`; pin with `pinned: true`.
- **Reading time** is computed in the `content:file:afterParse` hook in `nuxt.config.ts` (180 wpm) and injected as `content.readingTime`.
- **Site config**: `app/utils/config.ts` (title, description, theme, seasonal events).
- **Fonts**: `fonts.config.ts` declares families; `npm run fonts:download` pulls them from Bunny Fonts into `public/fonts/` for self-hosting.

## Styling convention

- Vanilla CSS only, no preprocessor. Each component has a **sibling `.css` file** (`Component.vue` + `Component.css`); the Vue `<style>` block generally only `@import`s it.
- Themes live in `public/styles/themes`; switch via `CURRENT_THEME` in `app/utils/config.ts`.

## Testing

- **Vitest** + `@nuxt/test-utils` (`environment: "nuxt"`, globals on). Test files are `*.test.ts` (note: `.spec.ts` also matched but convention is `.test.ts`), located in `app/components/__tests__/` and `app/utils/__tests__/`. Server-component tests use `.server.test.ts`.
- **Critical**: content cache must be off and storage in memory for tests, or SQLite indexing corrupts. `vitest.setup.ts` sets `NUXT_CONTENT_CACHE=false` / `NUXT_CONTENT_STORAGE=memory`, and `nuxt.config.ts` mirrors this when `NODE_ENV === "test"`.

## Quirks

- `npm install` runs `nuxt prepare` via `postinstall` (regenerates `.nuxt/` types).
- `.npmrc` sets `save-exact=true` — pin new deps with no `^`/`~`.
- Nuxt `future.compatibilityVersion: 5`.
- CI on `main`: `npm ci` → `npm run test` → `npm run generate`. Deploy uses `npm i --legacy-peer-deps` and needs `NUXT_PUBLIC_STUDIO_TOKENS`.
