package books

import (
	"encoding/json"
	"math"
	"os"
	"strconv"
	"strings"
	"testing"
)

// testdata/golden.json was produced by the original TypeScript implementation
// (src/utils/books.ts) before the Go rewrite, so the shelf can't drift.
type golden struct {
	Hash       map[string]uint32 `json:"hash"`
	Spines     map[string]string `json:"spines"`
	Mix        []string          `json:"mix"`
	Ink        []string          `json:"ink"`
	FormatRead map[string]string `json:"formatRead"`
}

func loadGolden(t *testing.T) golden {
	t.Helper()
	raw, err := os.ReadFile("testdata/golden.json")
	if err != nil {
		t.Fatal(err)
	}
	var g golden
	if err := json.Unmarshal(raw, &g); err != nil {
		t.Fatal(err)
	}
	return g
}

func TestHashMatchesTypeScript(t *testing.T) {
	for key, want := range loadGolden(t).Hash {
		if got := Hash(key); got != want {
			t.Errorf("Hash(%q) = %d, want %d", key, got, want)
		}
	}
}

func TestSpineStyleMatchesTypeScript(t *testing.T) {
	for key, want := range loadGolden(t).Spines {
		var got string
		switch key {
		case "dune-override":
			got = SpineStyle("/books/dune", "", "#a5491a", "xtall").CSSVars()
		case "title-only":
			got = SpineStyle("", "Senza path", "", "").CSSVars()
		default:
			got = SpineStyle(key, "", "", "").CSSVars()
		}
		if got != want {
			t.Errorf("SpineStyle(%q)\n got %s\nwant %s", key, got, want)
		}
	}
}

func TestMixAndInkMatchTypeScript(t *testing.T) {
	g := loadGolden(t)
	mix := []string{MixHex("#7c2d2d", 0.94, "#ffffff"), MixHex("#c9a227", 0.82, "#000000"), MixHex("#abc", 0.5, "#000")}
	for i := range mix {
		if mix[i] != g.Mix[i] {
			t.Errorf("mix[%d] = %s, want %s", i, mix[i], g.Mix[i])
		}
	}
	for i, c := range []string{"#7c2d2d", "#c9a227", "#ffffff", "nope", "#fff"} {
		if got := ReadableInk(c); got != g.Ink[i] {
			t.Errorf("ReadableInk(%s) = %s, want %s", c, got, g.Ink[i])
		}
	}
}

func TestFormatDateMatchesTypeScript(t *testing.T) {
	for in, want := range loadGolden(t).FormatRead {
		if got := FormatDate(in); got != want {
			t.Errorf("FormatDate(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestReadableInk(t *testing.T) {
	cases := map[string]string{"#ffffff": InkDark, "#1f3a5f": InkLight, "#000000": InkLight, "#c9a227": InkDark, "#fff": InkDark, "nope": InkLight, "#12345g": InkLight}
	for in, want := range cases {
		if got := ReadableInk(in); got != want {
			t.Errorf("ReadableInk(%s) = %s, want %s", in, got, want)
		}
	}
}

// Guards the palette: every colour, and both gradient ends, must carry the
// chosen ink at 4.5:1 or better.
func TestPaletteContrast(t *testing.T) {
	for _, c := range SpineColors {
		ink := ReadableInk(c)
		for _, bg := range []string{c, MixHex(c, LitMix, "#ffffff"), MixHex(c, ShadeMix, "#000000")} {
			if r := ContrastRatio(bg, ink); r < 4.5 {
				t.Errorf("%s (from %s) against %s: %.2f < 4.5", bg, c, ink, r)
			}
		}
	}
}

func TestMixHex(t *testing.T) {
	cases := []struct {
		color  string
		amount float64
		toward string
		want   string
	}{
		{"#000000", 0.5, "#ffffff", "#808080"},
		{"#ffffff", 0.5, "#000000", "#808080"},
		{"#256b6b", 1, "#ffffff", "#256b6b"},
		{"#fff", 1, "#000000", "#ffffff"},
		{"nope", 0.5, "#ffffff", "nope"},
		{"#256b6b", 0.5, "nope", "#256b6b"},
	}
	for _, c := range cases {
		if got := MixHex(c.color, c.amount, c.toward); got != c.want {
			t.Errorf("MixHex(%s, %v, %s) = %s, want %s", c.color, c.amount, c.toward, got, c.want)
		}
	}
}

func TestContrastRatio(t *testing.T) {
	if r := ContrastRatio("#000000", "#ffffff"); math.Abs(r-21) > 0.05 {
		t.Errorf("black on white = %v", r)
	}
	if r := ContrastRatio("nope", "#ffffff"); r != 1 {
		t.Errorf("unparseable = %v", r)
	}
}

func TestSpineStyle(t *testing.T) {
	s := SpineStyle("/books/dune", "", "#b4551f", "xtall")
	if s.Color != "#b4551f" || s.Height != SpineHeights["xtall"] {
		t.Errorf("override ignored: %+v", s)
	}
	if got := SpineStyle("/books/x", "", "#ffffff", "").Ink; got != InkDark {
		t.Errorf("ink from overridden colour = %s", got)
	}
	if h := SpineStyle("/books/dune", "", "", "enormous").Height; !strings.HasSuffix(h, "%") {
		t.Errorf("unknown height tier not replaced: %s", h)
	}

	// Height and width must vary independently (each hashed from its own key).
	pairs := map[string]map[string]bool{}
	colors := map[string]bool{}
	for i := 0; i < 200; i++ {
		s := SpineStyle("/books/book-"+strconv.Itoa(i), "", "", "")
		if pairs[s.Height] == nil {
			pairs[s.Height] = map[string]bool{}
		}
		pairs[s.Height][s.Width] = true
		colors[s.Color] = true
	}
	independent := false
	for _, widths := range pairs {
		independent = independent || len(widths) > 1
	}
	if !independent {
		t.Error("height and width are correlated")
	}
	if len(colors) != len(SpineColors) {
		t.Errorf("used %d of %d colours", len(colors), len(SpineColors))
	}
}

func TestSort(t *testing.T) {
	type book struct{ path, read string }
	in := []book{{"/books/c", "2022-09-20"}, {"/books/d", ""}, {"/books/a", "2025-03-14"}, {"/books/b", "2023-06"}}
	out := Sort(in, func(b book) string { return b.read })
	var got []string
	for _, b := range out {
		got = append(got, b.path)
	}
	if strings.Join(got, ",") != "/books/a,/books/b,/books/c,/books/d" {
		t.Errorf("order = %v", got)
	}
	if in[0].path != "/books/c" {
		t.Error("input mutated")
	}
	partial := Sort([]book{{"full", "2023-06-30"}, {"partial", "2023-07"}}, func(b book) string { return b.read })
	if partial[0].path != "partial" {
		t.Errorf("partial date sorted after full one")
	}
}
