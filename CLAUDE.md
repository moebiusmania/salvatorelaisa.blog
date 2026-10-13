# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> A detailed companion doc lives in [AGENTS.md](AGENTS.md). This file is the quick reference; consult AGENTS.md for the full command tables and content-authoring conventions.

## What this is

Personal blog (Italian-language) built with **[Hugo](https://gohugo.io/)** and a small **Go** toolbox (`cmd/blog`), with **Alpine.js** and **htmx** for client-side interactivity, exported as a **static site** to GitHub Pages. Content is Markdown. There is no JS toolchain (no Node, npm or Deno): Hugo bundles the client TypeScript with its built-in esbuild, and Alpine/htmx are vendored in `assets/js/vendor/`.

The site was migrated from Nuxt, then Lume. Some comments still mention them to explain why URLs, heading slugs, reading times and markup stay unchanged: the output must stay identical for visitors. Don't reintroduce a JS toolchain.

## Commands

Everything runs through `go run ./cmd/blog <command>` (or a built `./blog`):

```bash
blog serve               # dev server on :3000 with live reload, drafts hidden
blog serve --drafts      # including draft posts (--host to listen on the LAN)
blog build               # static build into _site/ (what CI deploys; never drafts)
go test ./...            # unit, dashboard and full site build tests (-short skips the build)
go vet ./... && gofmt -l .

# Run a single test / package
go test ./internal/books/ -run TestSpineStyle
go test ./internal/dashboard/ -update     # rewrite the dashboard golden snapshots

# Authoring
blog new post "Title"    # scaffold a post in content/ (also: new device, new book)
blog dashboard           # TUI admin dashboard (internal/dashboard): stats + buttons for `new`
blog drafts              # list draft posts
blog stats               # blog stats
blog webp <path> [--quality N]
blog todo list|add|done|remove|init
blog fonts download      # fetch the fonts in fonts.yaml into public/fonts/
blog vendor              # check/download the pinned Alpine.js and htmx builds
blog gen [--drafts]      # validate content + write data/gen/ (build and serve run it)
```

## Architecture

- **Hugo config**: `hugo.toml`. `publishDir` is `_site` because `public/` is our static *source* (mounted as Hugo's `static`). Mounts map `content/*.md` to the `post` section (`/post/<filename>/`), `routes/` to the content root, and the component/page CSS into assets. Goldmark: raw HTML on; typographer, linkify, strikethrough and auto heading ids off (see Markdown below).
- **Hugo version**: pinned in its own module, `tools/hugo/go.mod`, run as `go tool -modfile=tools/hugo/go.mod hugo …`, so the blog's dependencies never change Hugo's. Upgrade with `go get -modfile=tools/hugo/go.mod -tool github.com/gohugoio/hugo@vX.Y.Z`.
- **`blog gen`** (`internal/gen`) runs before every build/serve: it validates all front matter (`internal/content`, port of the old zod schemas; invalid front matter fails the build) and writes `data/gen/*.json` (gitignored): reading times and post count, devices, books (with precomputed spine styles, `internal/books`) and the about/halloween/xmas page bodies. `content/devices|books|pages` are data only, never Hugo pages.
- **Routes**: content adapters. `routes/_content.gotmpl` adds about, books, devices, now and `events/*`; `routes/post/_content.gotmpl` adds `/post/page/<n>/` (10 per page, from 1) and `/post/year/[<yyyy>/]`. Their layouts are in `layouts/route/`. Tags use Hugo's taxonomy (`layouts/taxonomy.html`, `term.html`). Home outputs: `rss.xml`, `search.json` and the htmx search fragment `/fragments/posts.html`.
- **Templates**: `layouts/baseof.html` is the HTML shell; components are partials in `layouts/_partials/components/` (one per former Vento component); helpers in `layouts/_partials/` (season, meta, post-info, href…).
- **Markdown**: `layouts/_markup/render-heading.html` reproduces the old Nuxt heading ids (`_` before a leading digit, etc.); `render-image.html` adds `fetchpriority="high"` to the first image; `layouts/_partials/content.html` post-processes rendered HTML for `::timeline{items="…"}` blocks and `~~strike~~` (→ `<s>`).
- **Client JS**: `assets/js/main.ts` (Alpine components: `themeToggle`, `backToTop`, `pwaInstallBanner`, `postSearch`, `bookshelf`, `weather`, `githubRepos`), bundled by `js.Build` in `layouts/_partials/assets/scripts.html`; `/now` config arrives via `@params` from `data/now.yaml` and `data/weather.yaml`. htmx is loaded only on the pagination pages, for the search.
- **Site config**: `hugo.toml` `[params]` (title, description, `currentTheme`, events, season emoji). `/now` data: `data/now.yaml`.
- **Go code**: `cmd/blog` (cobra CLI), `internal/{content,books,gen,scaffold,drafts,stats,todo,fonts,images,now,termtable}`, `internal/dashboard` (Bubble Tea v2 + Lip Gloss, frames painted into a cell canvas), `internal/site` (build test).
- **View transitions**: native cross-document transitions; `layouts/_partials/head/view-transitions.js` sets the slide direction for pagination.

## Styling convention

- Vanilla CSS only, no preprocessor. Each component has a **sibling `.css` file** in `_components/`, page styles live in `_includes/css/` (those folders now hold only CSS).
- `layouts/_partials/assets/styles.html` concatenates them into `/assets/app.css` (Badge and now/card first, then byte order, each file under a `/* path */` header). The seasonal decorations (`Clouds`, `Spooks`, `Snow`) are separate files (`/assets/clouds.css`, `spooks.css`, `snow.css`) linked by `baseof.html` only while their theme is active.
- Global styles and themes are in `public/styles/`. Switch themes via `currentTheme` in `hugo.toml`.

## Testing

- `go test` with table tests. `internal/books/testdata/golden.json` holds values captured from the original TypeScript (spines, hashes, reading times, dates): keep them matching.
- `internal/site/build_test.go` builds the whole site with the pinned Hugo into a temp dir and asserts on the output (routes, drafts, pagination, home pinned post, feed, search, hidden devices/books, seasonal nav, timeline, heading ids, CSS bundle).
- `internal/dashboard` tests drive the Bubble Tea model directly and compare frames with golden snapshots in `testdata/`.

## Quirks

- Pin dependency versions exactly (`go.mod`/`go.sum`; Hugo in `tools/hugo/go.mod`; Alpine/htmx versions + SHA-256 in `cmd/blog/assets.go`).
- Hugo templates escape by default: use `.Params.summary` (never `.Summary`, which Hugo renders as Markdown), `partial "href.html" $url | safeHTMLAttr` for data-driven links whose URL must stay byte-identical, and `jsonify (dict "noHTMLEscape" true)` for JSON in Alpine attributes.
- CI: PRs to `main` run `go test ./...` → `blog build` (`build.yml`). Pushes to `main` do the same, download fonts if missing, and deploy `_site` (`deploy.yml`).
- The Spooktober workflows edit `hugo.toml` and `content/spooktober-reloaded.md` with `sed`, so keep the `currentTheme = "…"` line format in `hugo.toml` and the `draft: true|false` front-matter line.
