package content

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The golden values come from the original TypeScript implementation.
type golden struct {
	ReadingTime map[string]int `json:"readingTime"`
	SplitCount  map[string]int `json:"splitCount"`
}

func loadGolden(t *testing.T) golden {
	t.Helper()
	raw, err := os.ReadFile("../books/testdata/golden.json")
	if err != nil {
		t.Fatal(err)
	}
	var g golden
	if err := json.Unmarshal(raw, &g); err != nil {
		t.Fatal(err)
	}
	return g
}

func TestSplitCountMatchesJS(t *testing.T) {
	for in, want := range loadGolden(t).SplitCount {
		if got := SplitCount(in); got != want {
			t.Errorf("SplitCount(%q) = %d, want %d", in, got, want)
		}
	}
}

func TestReadingTimeMatchesTypeScript(t *testing.T) {
	g := loadGolden(t)
	posts, err := LoadPosts("../../content")
	if err != nil {
		t.Fatal(err)
	}
	if len(posts) == 0 {
		t.Fatal("no posts loaded")
	}
	for _, p := range posts {
		want, ok := g.ReadingTime[p.Slug]
		if !ok {
			continue // a post added after the golden file was generated
		}
		if got := ReadingTime(p.Raw); got != want {
			t.Errorf("%s: reading time %d, want %d", p.Slug, got, want)
		}
	}
}

func TestSplit(t *testing.T) {
	fm, body, ok := Split("---\r\ntitle: x\r\n---\r\nbody\n")
	if !ok || fm != "title: x" || body != "body\n" {
		t.Errorf("got %q %q %v", fm, body, ok)
	}
	if _, body, ok := Split("no front matter"); ok || body != "no front matter" {
		t.Errorf("got %q %v", body, ok)
	}
}

func TestPostSchema(t *testing.T) {
	var p Post
	if _, err := Decode("---\ntitle: 1999\ndate: \"2024-02-17\"\ntags: [a]\ndraft: false\nimages: \"/x.webp\"\n---\n", "x.md", &p); err != nil {
		t.Fatal(err)
	}
	if *p.Title != "1999" || len(p.Images) != 1 || p.Images[0] != "/x.webp" {
		t.Errorf("coercion failed: %+v", p)
	}

	var bad Post
	_, err := Decode("---\ntitle: x\ndate: \"nope\"\ntags: [a]\n---\n", "bad.md", &bad)
	if err == nil || !strings.Contains(err.Error(), "bad.md") || !strings.Contains(err.Error(), "draft: required") || !strings.Contains(err.Error(), "date: invalid") {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestLoadCollectionSkipsHiddenAndDrafts(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "devices")
	os.Mkdir(dir, 0o755)
	write := func(name, fm string) {
		os.WriteFile(filepath.Join(dir, name), []byte("---\n"+fm+"---\nbody\n"), 0o644)
	}
	base := "title: T\npurchase: \"2020\"\ntags: []\nimage: \"\"\n"
	write("b.md", base)
	write("a.md", base)
	write("-hidden.md", base)
	write("draft.md", base+"draft: true\n")
	write("notes.txt", base)

	entries, err := LoadCollection[Device](dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) != 2 || entries[0].Slug != "a" || entries[1].Path != "/devices/b" || entries[0].Body != "body\n" {
		t.Errorf("entries = %+v", entries)
	}

	write("broken.md", "title: T\n")
	if _, err := LoadCollection[Device](dir); err == nil || !strings.Contains(err.Error(), "purchase: required") {
		t.Errorf("expected a validation error, got %v", err)
	}
}
