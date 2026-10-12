package scaffold

import (
	"errors"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestSlugify(t *testing.T) {
	cases := map[string]string{
		"Il mio nuovo post":    "il-mio-nuovo-post",
		"Steam Deck OLED!":     "steam-deck-oled",
		"Perché è così":        "perch-cos",
		"  spazi   multipli  ": "-spazi-multipli-",
		"1999":                 "1999",
	}
	for in, want := range cases {
		if got := Slugify(in); got != want {
			t.Errorf("Slugify(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestCreate(t *testing.T) {
	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, "content", "books"), 0o755)
	now := time.Date(2026, 10, 12, 23, 30, 0, 0, time.FixedZone("CEST", 2*3600))

	path, err := Book.Create(root, `Il "barone" rampante`, now)
	if err != nil {
		t.Fatal(err)
	}
	if path != "content/books/il-barone-rampante.md" {
		t.Errorf("path = %s", path)
	}
	raw, _ := os.ReadFile(filepath.Join(root, path))
	want := "---\ntitle: \"Il \\\"barone\\\" rampante\"\nauthor: \"\"\nlanguage: \"it\"\nread: \"2026-10-12\"\ndraft: true\n# url: \"\"\n# color: \"\"\n# height: \"\"\n---\n\n"
	if string(raw) != want {
		t.Errorf("file:\n%s\nwant:\n%s", raw, want)
	}

	if _, err := Book.Create(root, `Il "barone" rampante`, now); !errors.Is(err, os.ErrExist) {
		t.Errorf("second create: %v, want ErrExist", err)
	}
	if _, err := Post.Create(root, "", now); !errors.Is(err, ErrNoTitle) {
		t.Errorf("empty title: %v", err)
	}
}
