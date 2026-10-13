# AGENTS.md — salvatorelaisa.blog

## Project overview

Personal blog built with **[Hugo](https://gohugo.io/)** and a **Go** toolbox, exported as a **static site** to GitHub Pages.
Client-side interactivity uses **Alpine.js** and **htmx**, and content is authored in Markdown.

## Tooling model

Everything runs on **Go**. There is no JS toolchain: no Node, no npm, no Deno, no `package.json`.

- `go.mod` pins the blog's Go dependencies (cobra, Bubble Tea, Lip Gloss, yaml…).
- `tools/hugo/go.mod` pins Hugo, run as `go tool -modfile=tools/hugo/go.mod hugo`. It's a separate module so the blog's dependencies never change the ones Hugo is built with. The first run compiles Hugo (a few minutes), then it's cached.
- Client TypeScript (`assets/js/`) is bundled by Hugo's built-in esbuild. Alpine.js and htmx are vendored in `assets/js/vendor/` (versions and checksums in `cmd/blog/assets.go`, refreshed with `blog vendor`).

The site was migrated from Nuxt, then from Lume (Deno). Comments that mention them explain why URLs, heading slugs, reading times and markup stay unchanged.

## Developer commands

All commands are subcommands of `cmd/blog`: `go run ./cmd/blog <command>`, or build it once with `go build -o blog ./cmd/blog` and use `./blog <command>`. They work from any folder inside the repo.

### Site lifecycle

| Command | Description |
|---|---|
| `blog serve` | Dev server on :3000 with live reload (drafts hidden) |
| `blog serve --host` | Same, listening on all interfaces |
| `blog serve --drafts` | Dev server including draft posts |
| `blog build` | Static build into `_site/` (never includes drafts) |
| `blog gen [--drafts]` | Validate content and write `data/gen/` (run by `build` and `serve`) |
| `go test -count=1 ./...` | Unit, dashboard and full build tests (`-short` skips the build; `-count=1` because Go's test cache can't see the files Hugo reads) |
| `go vet ./...`, `gofmt -l .` | Lint and formatting |

### Content and utility commands

| Command | Description |
|---|---|
| `blog new post "<title>"` | Scaffold a new post in `content/` |
| `blog new device "<title>"` | Scaffold a new device card in `content/devices/` |
| `blog new book "<title>"` | Scaffold a new book (as a draft) in `content/books/` |
| `blog dashboard` | Mouse-driven TUI with blog stats, a Now panel and buttons for `new` |
| `blog stats` | Print blog stats |
| `blog drafts` | List draft posts |
| `blog webp <path> [--quality N]` | Convert PNG/JPG to WebP |
| `blog fonts download` | Download the fonts declared in `fonts.yaml` |
| `blog vendor` | Check/download the pinned Alpine.js and htmx builds |
| `blog todo init` | Create `todo.md` from `todo.template.md` |
| `blog todo list` | List todo items |
| `blog todo add "<text>"` | Add todo item |
| `blog todo remove <n>` | Remove todo item |
| `blog todo done <n>` | Mark todo item done |

## CI pipeline order

PR checks (`build.yml`) and the deploy on `main` (`deploy.yml`) both run:
`go test -count=1 ./...` → `go run ./cmd/blog build`. Before that, the deploy runs `blog fonts download` if any family in `fonts.yaml` has no local files. It then uploads `_site/` to GitHub Pages. `actions/setup-go` caches the modules and the compiled Hugo.

The scheduled Spooktober workflows (`spooktober-2026*.yml`) toggle `currentTheme` in `hugo.toml` (and flip `draft:` in `content/spooktober-reloaded.md`) with `sed`, run the tests, commit and dispatch a deploy. Keep the `currentTheme = "…"` line format.

## Testing

- Runner: `go test`, plain table tests.
- `internal/books/testdata/golden.json`: values captured from the original TypeScript implementation (spine hashes and styles, reading times, date labels) that the Go ports must keep matching.
- `internal/site/build_test.go`: builds the site with the pinned Hugo into a temp dir and checks routes, drafts, pagination, the home page, the feed, the search index and fragment, hidden devices/books, the seasonal header, timelines, heading ids, strikethrough and the CSS bundle.
- `internal/dashboard`: drives the Bubble Tea model with key/mouse messages and compares frames with golden snapshots (`go test ./internal/dashboard -update` rewrites them).
- `internal/now`, `internal/fonts`: network calls go to `httptest` servers.

## Architecture

- **Config**: `hugo.toml`. Mounts keep the repo layout: `content/*.md` → the `post` section, `routes/` → content root (adapters), `public/` → static (copied verbatim, dotfiles included), `_components/**.css` and `_includes/css/` → assets. Output goes to `_site/`.
- **Generated data**: `blog gen` (`internal/gen`) validates every front matter (`internal/content`) and writes `data/gen/`: `posts.json` (reading times, post count), `devices.json`, `books.json` (with spine styles from `internal/books`), `pages.json` (about, halloween, xmas). Invalid front matter fails the build.
- **Routes**: `routes/_content.gotmpl` (about, books, devices, now, events/halloween, events/xmas) and `routes/post/_content.gotmpl` (`/post/page/<n>/`, `/post/year/`, `/post/year/<yyyy>/`), rendered with `layouts/route/*.html`. Posts use `layouts/post/page.html`; tags use Hugo's taxonomy (`taxonomy.html`, `term.html`); home also outputs `rss.xml` (`home.rss.xml`), `search.json` (`home.searchjson.json`) and `/fragments/posts.html` (`home.searchfragment.html`).
- **Layouts**: `layouts/baseof.html` (HTML shell, head meta, seasonal CSS and decorations).
- **Components**: `layouts/_partials/components/*.html`, including `now/`, `content/` (seasonal decorations) and `icons/`.
- **Content**:
  - `content/*.md`: posts, served at `/post/<filename>/`.
  - `content/pages/`: about, halloween and xmas page bodies (data only).
  - `content/devices/`: device cards (data only).
  - `content/books/`: bookshelf entries (data only).
- **Markdown**: render hooks in `layouts/_markup/` (Nuxt-style heading ids, first-image priority) and `layouts/_partials/content.html` (timeline blocks, `~~strike~~` → `<s>`).
- **Client**: `assets/js/main.ts` holds the Alpine components, bundled to `/assets/js/main.js`; `now.ts` gets the `/now` config from `data/*.yaml` via `@params`. The post search loads `/fragments/posts.html` with htmx and filters it with Alpine.
- **Site config**: `hugo.toml` `[params]` (title, description, `currentTheme`, events); `/now` data in `data/now.yaml`, weather codes in `data/weather.yaml`.
- **CLI**: `cmd/blog` plus `internal/` packages (scaffold, drafts, stats, todo, fonts, images, now, dashboard).
- **Styling pattern**:
  - Each component has a sibling CSS file in `_components/` (`Component.css`, next to where the old template lived); page styles are in `_includes/css/`.
  - `layouts/_partials/assets/styles.html` bundles them into `/assets/app.css`, with separate files for the seasonal decorations (`clouds.css`, `spooks.css`, `snow.css`).
  - Global styles and themes live in `public/styles/`. A theme may add a `*.decor.css` layer (for example `halloween.decor.css`).
  - No CSS preprocessor.

## Content authoring

- New posts default to `draft: true`; set it to `false` to publish.
- Pinned posts use `pinned: true` in the front matter.
- Reading time is computed at build time (180 wpm over the raw file).
- Device cards in `content/devices/` use `title`, `purchase`, `tags`, `image`, and optionally `url` and `post`.
- Hide a device or book by prefixing its filename with `-` or setting `draft: true`.
- Timelines inside posts: `::timeline{items="2013 - one, 2015 - two"}` followed by a closing `::` line.
