# Rewrite: Deno + Lume → Go + Hugo + htmx + Alpine

## Context

The blog runs on Deno + Lume 3 (Vento templates, esbuild-bundled Alpine, Deno CLI scripts, and a hand-rolled TUI dashboard). The goal is to replace the whole toolchain with **Go + Hugo**, keeping **Alpine.js** and adding **htmx**, with **no JS toolchain** (no Deno, no Node, no npm). The CLI utilities and the dashboard become one Go binary.

Constraints:

- These stay byte-for-byte unchanged:
  - all CSS (`_components/*.css`, `_includes/css/*.css`, `public/styles/**`)
  - every Markdown file under `content/`
  - `public/`
- Deploy stays the same: a GitHub Actions build of `_site/`, uploaded to GitHub Pages.
- End users see no difference. The output HTML, URLs, feeds, anchors and reading times must match the current build. The parity diff in Phase 4 is what checks this.

Decisions already made:

- **Hugo** is pinned through a `tool` directive in `go.mod` and run as `go tool hugo`. `go.mod` becomes the single place versions are pinned, as `deno.json` is today.
- **Dashboard:** Bubble Tea + Lip Gloss, plus bubblezone for mouse hit areas.
- **htmx, pragmatic use:** only where Hugo can pre-render an HTML fragment. There is no `hx-boost`, so native cross-document view transitions stay as they are.

Work happens on the new branch **`rewrite/go-hugo`**, cut from `main`.

## Target layout

```
go.mod / go.sum              module + `tool github.com/gohugoio/hugo` (standard edition, no cgo)
hugo.toml                    site config, params (incl. currentTheme), mounts, outputs, markup
fonts.yaml                   replaces fonts.config.ts
cmd/blog/main.go             single CLI (cobra): build, serve, gen, new, drafts, stats, webp, todo, fonts, vendor, dashboard
internal/content/            front-matter parsing, schema validation (port of src/content-schema.ts),
                             collections (port of src/content.ts), reading time, slugify
internal/books/              hashString / mixHex / readableInk / spineStyle / sortBooks / formatRead
internal/gen/                writes data/gen/*.json consumed by Hugo
internal/{scaffold,drafts,stats,todo,fonts,images,now}/
internal/dashboard/          Bubble Tea app
internal/site/build_test.go  build contract (port of tests/build.test.ts)
layouts/                     Hugo templates (see Phase 3)
routes/_content.gotmpl       content adapter for non-post routes (mounted at content root)
assets/js/                   main.ts, now.ts, theme.ts, vendor/alpinejs-3.17.4.esm.js, vendor/htmx-<ver>.min.js
data/now.yaml                replaces constants in src/utils/now.ts
data/weather-codes.yaml      WMO → {emoji,label}; shared by client JS (via js.Build params) and the dashboard
data/gen/                    generated, gitignored
_components/*.css, _includes/css/*.css, public/, content/*.md   UNCHANGED
```

Files to delete:

- `deno.json`, `deno.lock`, `_config.ts`, `fonts.config.ts`, `content/_data.ts` (TypeScript, not Markdown content)
- the `src/`, `scripts/`, `tests/` and `pages/` folders
- every `*.vto`, `_includes/layouts/`, `_includes/partials/`, `assets/styles.page.ts`

## Phase 0: Branch and baseline

1. `git switch -c rewrite/go-hugo`.
2. Build the current site with `deno task build` into `_site_baseline/` (gitignored). This is the reference for the parity diff. Hugo isn't installed and Go 1.27 already is, so Deno is only needed for this one step.

## Phase 1: Skeleton and spike of the risky Hugo pieces

**`go.mod`:**
- Module `salvatorelaisa.blog`, `go 1.27`, and `tool github.com/gohugoio/hugo@<latest stable>`.
- Pin every dependency exactly; `go.sum` handles that.

**`hugo.toml`:**
- `baseURL = "https://salvatorelaisa.blog/"`, `languageCode = "it-IT"`, `defaultContentLanguage = "it"`, `timeZone = "UTC"`.
- `publishDir = "_site"`. This is critical: Hugo's default output dir `public/` is our *source* folder.
- `buildFuture = true`, to match Lume.
- `disableKinds = ["sitemap","robotsTXT"]`. Taxonomies: `tags` only.
- Mounts:
  - `content` → `content/post`, with `excludeFiles = ["devices/**","books/**","pages/**","_data.ts"]`
  - `routes` → `content`
  - `public` → `static`
  - `assets`, `layouts` and `data` mounted explicitly, because defining any mount replaces the defaults
  - `_components` → `assets/_components` (CSS only)
  - `_includes/css` → `assets/_includes/css`
- `permalinks.page.post = "/post/:contentbasename/"`.
- Markup:
  - `goldmark.renderer.unsafe = true`
  - `extensions.typographer.disable = true`
  - `extensions.linkify = false`
  - `parser.autoHeadingID = false`, since the heading hook sets the ids
- Outputs:
  - home: `html`, `rss` (baseName `rss`, giving `/rss.xml`), `searchjson` (baseName `search`, giving `/search.json`), `searchfragment` (`/fragments/posts.html`)
  - taxonomy and term: `html` only
  - section `/post`: `build.render = "never"` (through cascade), because Lume has no `/post/` index
- `[params]`:
  - `siteTitle`, `siteDescription`, `pinnedPostDescription`, `events`, `seasonEmoji`
  - **`currentTheme = "halloween"`** on its own line, in a fixed format the workflows edit with `sed`
  - `seasonEvent` is derived in a template partial

**Spike items.** Verify each with a throwaway build before going further:
- (a) Dotfiles in `public/` (`.nojekyll`, `_headers`, `CNAME`) get copied. If they don't, `blog build` copies them after the Hugo build.
- (b) Adapter pages can sit at `post/page/N`, `post/year`, `post/year/YYYY`, `about`, `events/halloween`, and so on, with the exact URLs.
- (c) The adapter can read `data/gen/posts.json` (with `site.Data`, or `os.ReadFile` plus `transform.Unmarshal`).
- (d) With the `it` language, `time.Format ":date_long"` gives "7 aprile 2025" and `":date_full"` gives "martedì 25 ottobre 2022". If not, use month and weekday lookup tables in `data/`.
- (e) `render-heading` can rebuild the slug from `.PlainText`.

## Phase 2: Go content core and `blog gen`

`internal/content`:
- Parse front matter with the same regex as `src/content.ts:22-34`, using `gopkg.in/yaml.v3`.
- Validate front matter with structs ported from `src/content-schema.ts`:
  - `title` is coerced to a string
  - `images` accepts a string or a list
  - `draft` is required on posts
  - an error message reads `Invalid front matter in <file>`
- `LoadCollection`: skip files starting with `-` and files with `draft: true`, then sort by slug.
- `ReadingTime(raw)`: an exact port of `Math.ceil(raw.split(/\s+/).length / 180)`, using JS's `\s` set, which includes NBSP and other Unicode spaces.

`internal/books` ports `src/utils/books.ts`:
- FNV-1a over UTF-16 code units, then the murmur3 finalizer (`spineStyle`, `mixHex`, `readableInk`, `sortBooks`).
- `formatRead` and `formatDate`: `d/m/yyyy` without padding, and a bare year passes through unchanged.
- Port the test vectors from `tests/utils/books.test.ts` into a Go table test.

`blog gen [--drafts]` writes `data/gen/`:
- `posts.json`: slug → `{readingTime, draft}`, plus the published count used for pagination.
- `devices.json`: sorted by `purchase` descending, with `formatDate` precomputed and the raw body included.
- `books.json`: `sortBooks` order, with `spineStyle` CSS vars and `formatRead` precomputed, and the raw body included.
- `pages.json`: about, halloween and xmas, with front matter and raw body.

Templates render each body with `.Page.RenderString (dict "display" "block")`, so the heading, image and timeline handling apply the same way the Lume `md` filter did today. Any validation failure makes the build fail, as it does now.

`blog build` runs `gen`, then `go tool hugo --panicOnWarning`. `blog serve [--drafts] [--host]` runs `gen`, then `go tool hugo server --port 3000 [-D] [--bind 0.0.0.0]`, and runs `gen` again on changes under `content/` (via fsnotify).

## Phase 3: Templates (Vento → Hugo)

- **Shell:** port `_includes/layouts/base.vto` to `layouts/baseof.html`. Keep the exact head order: theme-init inline script, `@view-transition` style, inline view-transitions script, preloads, stylesheets, meta/og/twitter tags (note: twitter uses `property=`), RSS, manifest and favicons. Page data for `metaTitle`, `metaDescription`, `og` and `url` comes from params set by the adapter or post templates.
- **Inline scripts:** move `themeInitScript` (`src/helpers.ts`) and `_includes/partials/view-transitions.js` to `layouts/_partials/*.js`. Inline both with `safeJS`.
- **Components:** each `_components/**/*.vto` becomes `layouts/_partials/components/<path>.html` with the same markup and Alpine attributes. Block components (`Container`, `PostsList`) take a `content` dict key.
  - Clouds and Spooks use `math.Rand` at build time.
  - The Footer year uses `now.Year`.
  - `Outdated` compares `now.Year` with the post's year.
  - The Footer credit changes from "Lume" to "Hugo". This is the only intentional visible change.
- **Posts:** `layouts/post/single.html` (port of `post.vto`).
  - Reading time comes from `data/gen/posts.json`.
  - Use `.Params.summary`, never `.Summary`, because Hugo renders the front-matter summary as Markdown.
  - Use `.Params.images`, and never use Hugo's internal OpenGraph templates.
  - Timeline post-processing on `.Content` is done in `layouts/_partials/timeline.html` with `replaceRE`. It matches the `<p>::timeline{…}\n::</p>` paragraph and outputs the exact markup from `src/markdown/timeline.ts:259-261`, with the same defaults and escaping. Content is untouched; this is the only option that works without editing the Markdown.
- **Markdown hooks:**
  - `layouts/_markup/render-heading.html` ports `src/markdown/heading-ids.ts`: lowercase, strip `[^\p{L}\p{M}\p{N}\p{Pc}\s-]`, whitespace → `-`, collapse `-`, trim `-`, `_` prefix before a digit, `-N` suffix for duplicates (tracked in `.Page.Store`). Hugo's default would change 60 of 254 anchors.
  - `render-image.html` adds `fetchpriority="high"` when `.Ordinal` is 0.
- **Routes:** `routes/_content.gotmpl` adds about, books, devices, now, `events/halloween`, `events/xmas`, `post/page/1..N` (10 per page, N from `posts.json`), `post/year` and `post/year/2010..now.Year`, empty years included. Each page uses its own layout under `layouts/route/`. `404.html` is native. Tags use Hugo's taxonomy (`/tags/`, `/tags/<tag>/`), sorted by count descending, with ties in the same order as Lume's.
- **Home:** `layouts/home.html` puts the first pinned post first, then the latest 5 without duplicates.
- **Feeds:** `home.rss.xml` copies `pages/rss.xml.page.ts` exactly: 20 items, link and GUID without a trailing slash, `<category>` per tag, `enclosure type="image/webp"`, tab indentation. `home.searchjson.json` keeps the same shape and order as `search.json` today.
- **CSS:** `layouts/_partials/styles.html` builds `/assets/app.css` with `resources.FromString`, in the exact order from `assets/styles.page.ts`: Badge and now/card first, then the sorted rest, each file with a `/* <path> */` header, joined by `\n`. It also builds `clouds.css`, `spooks.css` and `snow.css`. Goal: byte-identical files.
- **JS:**
  - `assets/js/main.ts` (TS kept) is bundled by Hugo's built-in `js.Build` to `/assets/js/main.js`. Hugo's embedded esbuild is part of the Hugo binary, not a JS toolchain.
  - Alpine and htmx are vendored as pinned ESM/min files in `assets/js/vendor/`. `blog vendor` refreshes them, with the versions and checksums held in Go constants.
  - `now.ts` gets its constants and the weather-code map from `data/*.yaml` through `js.Build` `params` (`@params`).
- **htmx (search):**
  - `post-page` loads `/fragments/posts.html` (every post rendered with the same `PostPreview` partial) with `hx-get` on first focus or input, replacing the hand-copied `<template x-for>` markup.
  - Alpine keeps the query state and filters with `x-show` against `data-title`, case-insensitive substring.
  - The fragment markup must equal what the `x-for` template renders today.
  - htmx loads only on that layout.
  - `/search.json` is still generated (public URL).
- **What stays in Alpine:** theme toggle, back-to-top, PWA banner, bookshelf dialogs and the `/now` weather and GitHub widgets. Those widgets call third-party JSON APIs with no HTML endpoint.

## Phase 4: Parity check

- `internal/site/build_test.go` ports every assertion from `tests/build.test.ts`: required paths, published vs draft posts, pagination bounds, home pinned post and ≤6 previews, `search.json` count, RSS ≤20 items and the link regex, hidden `-` devices and books, `event-nav` ⇔ season event, timeline markup and `id="_10-anni-dopo"`. It builds into `_site_test` with `--destination` and reads `currentTheme` from `hugo.toml`.
- `go run ./internal/parity _site_baseline _site` is a throwaway tool, deleted before merge. It walks both trees and:
  - parses HTML with `golang.org/x/net/html` and compares normalized DOMs (whitespace collapsed, attributes sorted)
  - compares CSS, JSON, XML and static files byte for byte
  - ignores known-volatile values: RSS `lastBuildDate`, Clouds/Spooks random vars, the `main.js` bundle and the Footer credit
- Iterate until the diff is empty. Expected snags:
  - Goldmark `<del>` vs markdown-it `<s>` for `~~`. Check that no CSS targets `s`; if so, accept it.
  - Tag tie ordering.
  - Heading `.PlainText` edge cases.

## Phase 5: CLI ports (`cmd/blog` + `internal/*`)

Each command keeps today's behavior and messages:

- `new post|device|book <title>` → `internal/scaffold`. Same slugify (`scripts/_compose.ts:2-7`), same front-matter templates byte for byte, the date in UTC, the same YAML escaping, and `O_EXCL` so it refuses to overwrite.
- `drafts`, `stats`: same tables (`github.com/olekukonko/tablewriter`) and the same sort and count rules.
- `webp <path> [--quality N]`: decode with stdlib png/jpeg, encode with `github.com/gen2brain/webp` (pure Go, via wazero). Same rules: non-recursive, extension replaced, overwrite.
- `todo init|list|add|remove|done`: the same `todo.md` format and Italian messages.
- `fonts download`: same Bunny URL, file naming `<slug>-NN.<ext>`, URL rewrite, `font-display: swap` injection and header. Reads `fonts.yaml`.
- `vendor`: refreshes Alpine and htmx.

Each package gets table tests: the scaffold templates, drafts sorting, the todo round-trip, font CSS rewriting against fixture CSS, and the weather-code mapping (from `tests/utils/now.test.ts`, now data-driven).

## Phase 6: Dashboard (Bubble Tea)

`internal/dashboard`, launched with `blog dashboard`, reproduces the current screens from `scripts/dashboard/app.ts`:
- Header, clock and theme.
- Responsive stat cards (6/5/4) with big digits, "Posts per year" vbars and "Top tags" hbars.
- Recent and Drafts lists with wheel scrolling.
- The action bar.
- The status bar: toasts, hover details and key hints.
- The "New …" modal: title input with readline keys, path preview and validation. It calls `internal/scaffold` directly instead of running `deno task`.
- The Now modal: reads `data/now.yaml` again on every open; weather and GitHub are fetched through `internal/now`, and stale results are discarded with a token.

Also:
- The palette comes from `theme.ts`.
- Keybindings are the same.
- The minimum size is 60×20.
- fsnotify on `content/` and `hugo.toml`, debounced 200 ms.
- Stats reuse `internal/content`.

Tests use `teatest` and golden snapshots of the main view and both modals at fixed sizes. These replace the screen and terminal tests, because Bubble Tea owns rendering and input parsing.

## Phase 7: CI, workflows, docs, cleanup

- `build.yml` and `deploy.yml`:
  - `actions/setup-go@v6` with `go-version-file: go.mod` and `cache: true`, which also caches the compiled Hugo
  - `go test ./...`, then `go run ./cmd/blog build`
  - upload and deploy `_site` (unchanged)
  - The font check reads family names from `fonts.yaml` and runs `go run ./cmd/blog fonts download`.
- Spooktober workflows: swap Deno for Go, and point the `sed`/`grep -qx` at `hugo.toml`, for example `s/^currentTheme = "[a-z]+"$/currentTheme = "default"/`. **`spooktober-2026-end.yml` fires on Nov 1. If this branch merges before then, it must already contain the updated workflow. If not, nothing changes.** The `draft:` sed on `content/spooktober-reloaded.md` stays as it is.
- `.gitignore`: add `data/gen/`, `resources/`, `.hugo_build.lock`, `_site_baseline`, `/blog` (the binary).
- `.gitpod.yml`: `go mod download`. `.vscode`: Go and Hugo extensions instead of Volar and Deno.
- Rewrite `CLAUDE.md`, `AGENTS.md` and `README.md` for the new commands and architecture.
- Delete the Deno and Lume files listed above, and `internal/parity`.

## Verification

1. `go vet ./...`, `gofmt -l .` (empty) and `go test ./...` pass. The tests cover the build contract, books/spines, reading time, scaffold, drafts, stats, todo, fonts and the dashboard.
2. `go run ./cmd/blog build` succeeds, and `go run ./internal/parity _site_baseline _site` reports no differences beyond the whitelisted volatile items.
3. `git diff main --stat -- content public _components '*.css'` shows nothing changed. The exception is the deleted `content/_data.ts` and `.vto` files.
4. Manual checks by the user in a browser (no headless browser installs):
   - `go run ./cmd/blog serve`, then: theme toggle and cookie, pagination slide transitions, search (htmx fragment and filtering), the bookshelf dialog, `/now` weather and GitHub, the halloween accordion and decor, the PWA banner.
   - `serve --drafts` shows the drafts.
5. CLI smoke tests:
   - `new post "Prova"` creates the file; run it a second time and it refuses.
   - `drafts`, `stats`, `todo list`.
   - `webp` on a sample image.
   - `dashboard` in a real terminal: the New modal creates a file, and the Now modal loads.
6. Open a PR to `main`. The `build.yml` run must pass before merging.
