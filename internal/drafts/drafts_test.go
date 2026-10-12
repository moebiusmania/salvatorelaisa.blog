package drafts

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestList(t *testing.T) {
	dir := t.TempDir()
	write := func(name, body string) { os.WriteFile(filepath.Join(dir, name), []byte(body), 0o644) }
	write("a.md", "---\ntitle: Uno due tre quattro cinque sei sette\ndate: \"2020-4-3\"\ntags: [x, y]\ndraft: true\n---\n")
	write("b.md", "---\ntitle: Vecchio\ndate: 2019-01-02\ndraft: true\n---\n")
	write("c.md", "---\ntitle: Senza data\ndraft: true\n---\n")
	write("d.md", "---\ntitle: Pubblicato\ndraft: false\n---\n")
	write("e.md", "---\ntitle: [broken\ndraft: true\n---\n")

	got, err := List(dir)
	if err != nil {
		t.Fatal(err)
	}
	var lines []string
	for _, d := range got {
		lines = append(lines, d.Date+" | "+d.Title+" | "+d.Tags)
	}
	want := []string{
		"2019-01-02 | Vecchio | No tags",
		"2020-04-03 | Uno due tre quattro cinque sei... | x, y",
		"No date | Senza data | No tags",
	}
	if strings.Join(lines, "\n") != strings.Join(want, "\n") {
		t.Errorf("got\n%s\nwant\n%s", strings.Join(lines, "\n"), strings.Join(want, "\n"))
	}
	if Render(nil) != "No draft posts found.\n" {
		t.Error("empty render")
	}
	if out := Render(got); !strings.HasPrefix(out, "\n📝 Draft Posts (3):\n\n┌") {
		t.Errorf("render = %q", out[:40])
	}
}
