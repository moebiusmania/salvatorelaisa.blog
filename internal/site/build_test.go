// Package site holds the end-to-end build test: it builds the whole site with
// the pinned Hugo into a temporary folder and checks the generated output
// (routes, drafts, home ordering, feed, search, seasonal header, Markdown
// extensions). Skipped with -short.
package site

import (
	"context"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/pelletier/go-toml/v2"

	"salvatorelaisa.blog/internal/content"
	"salvatorelaisa.blog/internal/gen"
)

const root = "../.."

type config struct {
	Params struct {
		SiteTitle    string            `toml:"siteTitle"`
		CurrentTheme string            `toml:"currentTheme"`
		SeasonEvents map[string]string `toml:"seasonEvents"`
	} `toml:"params"`
}

type postFile struct {
	slug          string
	draft, pinned bool
}

// build runs the same steps as `blog build`, into a temporary folder.
func build(t *testing.T) string {
	t.Helper()
	if testing.Short() {
		t.Skip("full site build skipped in -short mode")
	}
	if err := gen.Run(gen.Options{Root: root}); err != nil {
		t.Fatal(err)
	}
	dest := t.TempDir()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()
	cmd := exec.CommandContext(ctx, "go", "tool", "hugo", "--quiet", "--panicOnWarning", "--destination", dest)
	cmd.Dir = root
	if out, err := cmd.CombinedOutput(); err != nil {
		t.Fatalf("hugo build failed: %v\n%s", err, out)
	}
	return dest
}

func TestSiteBuild(t *testing.T) {
	dest := build(t)

	read := func(t *testing.T, path string) string {
		t.Helper()
		raw, err := os.ReadFile(filepath.Join(dest, path))
		if err != nil {
			t.Fatal(err)
		}
		return string(raw)
	}
	exists := func(path string) bool {
		_, err := os.Stat(filepath.Join(dest, path))
		return err == nil
	}

	// Posts as they sit on disk, to cross-check what the build did with them.
	loaded, err := content.LoadPosts(filepath.Join(root, "content"))
	if err != nil {
		t.Fatal(err)
	}
	var posts, published []postFile
	for _, p := range loaded {
		post := postFile{slug: p.Slug, draft: p.IsDraft(), pinned: p.Pinned}
		posts = append(posts, post)
		if !post.draft {
			published = append(published, post)
		}
	}

	var cfg config
	raw, err := os.ReadFile(filepath.Join(root, "hugo.toml"))
	if err != nil {
		t.Fatal(err)
	}
	if err := toml.Unmarshal(raw, &cfg); err != nil {
		t.Fatal(err)
	}

	t.Run("generates the top-level routes", func(t *testing.T) {
		for _, path := range []string{
			"/index.html", "/404.html", "/about/index.html", "/books/index.html",
			"/devices/index.html", "/now/index.html", "/tags/index.html",
			"/post/page/1/index.html", "/post/year/index.html", "/events/xmas/index.html",
			"/events/halloween/index.html", "/rss.xml", "/search.json", "/assets/app.css",
			"/assets/js/main.js", "/manifest.json", "/fragments/posts.html",
			"/_headers", "/.nojekyll", "/CNAME",
		} {
			if !exists(path) {
				t.Errorf("%s is missing", path)
			}
		}
	})

	t.Run("adds no routes the old site didn't have", func(t *testing.T) {
		for _, path := range []string{"/post/index.html", "/events/index.html", "/sitemap.xml", "/index.xml", "/tags/index.xml"} {
			if exists(path) {
				t.Errorf("%s should not exist", path)
			}
		}
	})

	t.Run("publishes every non-draft post at /post/<slug>/ and skips drafts", func(t *testing.T) {
		for _, post := range posts {
			if got := exists("/post/" + post.slug + "/index.html"); got == post.draft {
				t.Errorf("%s: published = %v, draft = %v", post.slug, got, post.draft)
			}
		}
	})

	t.Run("paginates all published posts, 10 per page", func(t *testing.T) {
		pages := (len(published) + 9) / 10
		if !exists("/post/page/" + strconv.Itoa(pages) + "/index.html") {
			t.Errorf("last page %d is missing", pages)
		}
		if exists("/post/page/" + strconv.Itoa(pages+1) + "/index.html") {
			t.Errorf("page %d should not exist", pages+1)
		}
	})

	t.Run("puts the pinned post first on the home page", func(t *testing.T) {
		html := read(t, "/index.html")
		first := regexp.MustCompile(`view-transition-name:post-title-([^;]+);`).FindStringSubmatch(html)
		for _, post := range published {
			if post.pinned {
				if first == nil || first[1] != post.slug {
					t.Errorf("first post = %v, want pinned %s", first, post.slug)
				}
				break
			}
		}
		if n := strings.Count(html, `class="post-preview`); n > 6 {
			t.Errorf("%d previews on the home page, want at most 6", n)
		}
	})

	t.Run("indexes every published post for the search", func(t *testing.T) {
		var index []map[string]any
		if err := json.Unmarshal([]byte(read(t, "/search.json")), &index); err != nil {
			t.Fatal(err)
		}
		if len(index) != len(published) {
			t.Errorf("search.json has %d entries, want %d", len(index), len(published))
		}
		if n := strings.Count(read(t, "/fragments/posts.html"), "data-slug="); n != len(published) {
			t.Errorf("search fragment has %d entries, want %d", n, len(published))
		}
	})

	t.Run("keeps at most 20 items in the feed, with extensionless post links", func(t *testing.T) {
		rss := read(t, "/rss.xml")
		if n := strings.Count(rss, "<item>"); n > 20 || n == 0 {
			t.Errorf("%d feed items, want 1-20", n)
		}
		postLink := regexp.MustCompile(`^https://salvatorelaisa\.blog/post/[^/]+$`)
		links := regexp.MustCompile(`<link>([^<]+)</link>`).FindAllStringSubmatch(rss, -1)
		for _, link := range links[1:] {
			if !postLink.MatchString(link[1]) {
				t.Errorf("feed link %q", link[1])
			}
		}
	})

	t.Run("never publishes devices or books hidden with a leading dash", func(t *testing.T) {
		if strings.Contains(read(t, "/devices/index.html"), "Amazon Echo") {
			t.Error("hidden device published")
		}
		if strings.Contains(read(t, "/books/index.html"), "Il Signore degli Anelli") {
			t.Error("hidden book published")
		}
	})

	t.Run("renders the header, with the seasonal event only when a theme is on", func(t *testing.T) {
		html := read(t, "/index.html")
		if !strings.Contains(html, "<span>"+cfg.Params.SiteTitle+"</span>") {
			t.Error("site title missing from the header")
		}
		_, hasEvent := cfg.Params.SeasonEvents[strings.ToLower(cfg.Params.CurrentTheme)]
		if got := strings.Contains(html, "event-nav"); got != hasEvent {
			t.Errorf("event-nav present = %v, want %v (theme %q)", got, hasEvent, cfg.Params.CurrentTheme)
		}
		if strings.Contains(html, `name="generator"`) {
			t.Error("Hugo generator meta tag injected")
		}
	})

	t.Run("renders the MDC timeline, Nuxt heading ids and <s> strikethrough in posts", func(t *testing.T) {
		html := read(t, "/post/android-switch/index.html")
		for _, want := range []string{`class="timeline-container"`, `id="_10-anni-dopo"`} {
			if !strings.Contains(html, want) {
				t.Errorf("android-switch: %s missing", want)
			}
		}
		html = read(t, "/post/sperimentando-il-chromecast/index.html")
		if !strings.Contains(html, "<s>Qual'è il vero punto debole?</s>") || strings.Contains(html, "~~") {
			t.Error("sperimentando-il-chromecast: ~~strikethrough~~ not rendered as <s>")
		}
	})

	t.Run("bundles the component CSS in the original order", func(t *testing.T) {
		css := read(t, "/assets/app.css")
		if !strings.HasPrefix(css, "/* _components/Badge.css */\n") {
			t.Errorf("app.css starts with %q", css[:min(len(css), 60)])
		}
		for _, decoration := range []string{"Clouds.css", "Spooks.css", "Snow.css"} {
			if strings.Contains(css, decoration) {
				t.Errorf("app.css includes the %s decoration", decoration)
			}
		}
	})
}
