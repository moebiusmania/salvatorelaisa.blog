// Package books holds the presentation logic for the /books shelf.
//
// Every book is drawn as a spine seen from the side, and the shelf only looks
// like a shelf if the spines differ in colour, height and thickness. Those
// variations have to be stable across builds, so they are derived from a hash
// of the book's path instead of a random number. A book can always opt out via
// the `color` / `height` front matter.
package books

import (
	"fmt"
	"math"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf16"
)

// SpineHeights are percentages of the shelf slot, so a spine of any height
// still stands on the plank.
var SpineHeights = map[string]string{
	"short":  "80%",
	"medium": "87%",
	"tall":   "93%",
	"xtall":  "100%",
}

var heightKeys = []string{"short", "medium", "tall", "xtall"}

// SpineColors are book-cloth tones, deliberately not theme tokens.
var SpineColors = []string{
	"#7c2d2d", // oxblood
	"#2f4f3e", // forest
	"#1f3a5f", // navy
	"#c9a227", // mustard
	"#256b6b", // teal
	"#5b3a67", // plum
	"#a5491a", // rust
	"#4a5568", // slate
	"#8a3d52", // burgundy rose
	"#3f6b35", // olive
}

// SpineWidths: the thinnest still fits two stacked lines (title and author).
var SpineWidths = []string{"2.6rem", "3rem", "3.4rem", "3.9rem"}

const (
	InkLight = "#f6f2ea"
	InkDark  = "#1a1714"
	// LitMix and ShadeMix push the spine's gradient ends off the base colour.
	// The lit side carries the text, so it is kept small to preserve contrast.
	LitMix   = 0.94
	ShadeMix = 0.82
)

// Hash is FNV-1a (32 bit, over UTF-16 code units like the original JS)
// followed by a MurmurHash3 finalizer, which mixes the low bits so that
// `hash % n` for a small n doesn't move in lockstep across similar keys.
func Hash(input string) uint32 {
	h := uint32(2166136261)
	for _, unit := range utf16.Encode([]rune(input)) {
		h ^= uint32(unit)
		h *= 16777619
	}
	h ^= h >> 16
	h *= 2246822507
	h ^= h >> 13
	h *= 3266489909
	h ^= h >> 16
	return h
}

// Each attribute is hashed from its own key, so colour, height and thickness
// vary independently.
func pick(list []string, key string) string {
	return list[Hash(key)%uint32(len(list))]
}

var hexRE = regexp.MustCompile(`^[0-9a-fA-F]{6}$`)

func parseHex(color string) ([3]float64, bool) {
	hex := strings.Replace(color, "#", "", 1)
	if len(hex) == 3 {
		hex = string([]byte{hex[0], hex[0], hex[1], hex[1], hex[2], hex[2]})
	}
	if !hexRE.MatchString(hex) {
		return [3]float64{}, false
	}
	var rgb [3]float64
	for i := range rgb {
		v, _ := strconv.ParseUint(hex[i*2:i*2+2], 16, 8)
		rgb[i] = float64(v)
	}
	return rgb, true
}

// luminance is the WCAG relative luminance.
func luminance(color string) (float64, bool) {
	rgb, ok := parseHex(color)
	if !ok {
		return 0, false
	}
	var ch [3]float64
	for i, v := range rgb {
		v /= 255
		if v <= 0.03928 {
			ch[i] = v / 12.92
		} else {
			ch[i] = math.Pow((v+0.055)/1.055, 2.4)
		}
	}
	return 0.2126*ch[0] + 0.7152*ch[1] + 0.0722*ch[2], true
}

func contrast(a, b float64) float64 {
	return (math.Max(a, b) + 0.05) / (math.Min(a, b) + 0.05)
}

// ContrastRatio is the WCAG contrast ratio between two hex colours, or 1 if
// either is unparseable.
func ContrastRatio(a, b string) float64 {
	la, okA := luminance(a)
	lb, okB := luminance(b)
	if !okA || !okB {
		return 1
	}
	return contrast(la, lb)
}

// ReadableInk returns whichever ink wins on WCAG contrast against background.
func ReadableInk(background string) string {
	bg, ok := luminance(background)
	if !ok {
		return InkLight
	}
	light, _ := luminance(InkLight)
	dark, _ := luminance(InkDark)
	if contrast(bg, dark) >= contrast(bg, light) {
		return InkDark
	}
	return InkLight
}

// MixHex blends color toward `toward` channel-wise in gamma-encoded sRGB (like
// `color-mix(in srgb, …)`). Unparseable input is returned unchanged.
func MixHex(color string, amount float64, toward string) string {
	base, okA := parseHex(color)
	other, okB := parseHex(toward)
	if !okA || !okB {
		return color
	}
	var b strings.Builder
	b.WriteByte('#')
	for i := range base {
		// Math.round rounds halves up.
		fmt.Fprintf(&b, "%02x", int(math.Floor(base[i]*amount+other[i]*(1-amount)+0.5)))
	}
	return b.String()
}

// Spine is the set of CSS custom properties one spine needs.
type Spine struct {
	Color, Lit, Shade, Height, Width, Ink string
}

// CSSVars renders the spine as an inline style value.
func (s Spine) CSSVars() string {
	return "--book-color:" + s.Color + ";--book-lit:" + s.Lit + ";--book-shade:" + s.Shade +
		";--book-height:" + s.Height + ";--book-width:" + s.Width + ";--book-ink:" + s.Ink + ";"
}

// SpineStyle derives a book's spine from its path (or title). Front matter
// colour and height win over the hash.
func SpineStyle(path, title, color, height string) Spine {
	key := path
	if key == "" {
		key = title
	}
	if color == "" {
		color = pick(SpineColors, key+":color")
	}
	if _, ok := SpineHeights[height]; !ok {
		height = pick(heightKeys, key+":height")
	}
	return Spine{
		Color:  color,
		Lit:    MixHex(color, LitMix, "#ffffff"),
		Shade:  MixHex(color, ShadeMix, "#000000"),
		Height: SpineHeights[height],
		Width:  pick(SpineWidths, key+":width"),
		Ink:    ReadableInk(color),
	}
}

// Sort orders books most recently read first; books with no read date collect
// at the end. A string compare works for both "2025-03-14" and "2025-03".
func Sort[T any](items []T, read func(T) string) []T {
	out := append([]T(nil), items...)
	sort.SliceStable(out, func(i, j int) bool {
		a, b := read(out[i]), read(out[j])
		if a == "" || b == "" {
			return a != "" && b == ""
		}
		return a > b
	})
	return out
}

// FormatDate renders a purchase/read date the way `toLocaleDateString("it")`
// did: a bare year passes through, anything else becomes dd/mm/yyyy (a month
// alone is the 1st of that month).
func FormatDate(value string) string {
	if !strings.Contains(value, "-") {
		return value
	}
	for _, layout := range []string{"2006-01-02", "2006-01"} {
		if t, err := time.Parse(layout, value); err == nil {
			return t.Format("02/01/2006")
		}
	}
	return value
}
