package dashboard

import (
	"strings"

	"charm.land/lipgloss/v2"
	"github.com/rivo/uniseg"
)

// Color is a 24-bit RGB value. The zero value means "keep the color already
// in the cell", so real colors carry a marker bit; build them with RGB.
type Color uint32

const colorSet = 1 << 24

// RGB makes a Color from 0xRRGGBB.
func RGB(rgb uint32) Color { return Color(rgb&0xffffff | colorSet) }

func (c Color) rgb() uint32 { return uint32(c) & 0xffffff }

// Style is how text or a fill is painted. Unset colors keep the cell's.
type Style struct {
	FG, BG                       Color
	Bold, Dim, Italic, Underline bool
}

// Rect is a cell rectangle.
type Rect struct{ X, Y, W, H int }

func (r Rect) contains(x, y int) bool {
	return x >= r.X && y >= r.Y && x < r.X+r.W && y < r.Y+r.H
}

// inset shrinks a rectangle by dx columns and dy rows on every side.
func inset(r Rect, dx, dy int) Rect {
	return Rect{r.X + dx, r.Y + dy, max(0, r.W-dx*2), max(0, r.H-dy*2)}
}

type cell struct {
	char   string // "" marks the second column of a wide character
	fg, bg Color
	attrs  Style // only the attribute flags are used
}

// Canvas is an immediate-mode cell grid: each frame is painted from scratch,
// then rendered to a styled string for Bubble Tea.
type Canvas struct {
	W, H  int
	cells []cell
}

// NewCanvas makes a w×h canvas filled with bg.
func NewCanvas(w, h int, bg, fg Color) *Canvas {
	c := &Canvas{W: w, H: h, cells: make([]cell, w*h)}
	for i := range c.cells {
		c.cells[i] = cell{char: " ", fg: fg, bg: bg}
	}
	return c
}

func (c *Canvas) put(x, y int, char string, s Style) {
	if x < 0 || y < 0 || x >= c.W || y >= c.H {
		return
	}
	i := y*c.W + x
	// Overwriting either half of a wide character blanks the other half.
	if c.cells[i].char == "" && x > 0 {
		c.cells[i-1].char = " "
	}
	if x+1 < c.W && c.cells[i+1].char == "" {
		c.cells[i+1].char = " "
	}
	c.cells[i].char = char
	if s.FG != 0 {
		c.cells[i].fg = s.FG
	}
	if s.BG != 0 {
		c.cells[i].bg = s.BG
	}
	c.cells[i].attrs = Style{Bold: s.Bold, Dim: s.Dim, Italic: s.Italic, Underline: s.Underline}
}

// Fill paints every cell of r.
func (c *Canvas) Fill(r Rect, s Style) {
	for y := r.Y; y < r.Y+r.H; y++ {
		for x := r.X; x < r.X+r.W; x++ {
			c.put(x, y, " ", s)
		}
	}
}

// Text draws single-line text and returns the number of columns used.
func (c *Canvas) Text(x, y int, text string, s Style) int {
	col := x
	g := uniseg.NewGraphemes(text)
	for g.Next() {
		cluster, w := g.Str(), width(g.Str())
		switch w {
		case 0:
			continue
		case 2:
			if col+1 >= c.W {
				c.put(col, y, " ", s)
			} else {
				c.put(col, y, cluster, s)
				c.put(col+1, y, "", s)
			}
		default:
			c.put(col, y, cluster, s)
		}
		col += w
	}
	return col - x
}

// MapColors rewrites every color painted so far (used to dim the screen
// behind a modal).
func (c *Canvas) MapColors(fn func(Color) Color) {
	for i := range c.cells {
		c.cells[i].fg = fn(c.cells[i].fg)
		c.cells[i].bg = fn(c.cells[i].bg)
	}
}

// String renders the canvas, one styled run per change of style.
func (c *Canvas) String() string {
	var b strings.Builder
	for y := 0; y < c.H; y++ {
		if y > 0 {
			b.WriteByte('\n')
		}
		row := c.cells[y*c.W : (y+1)*c.W]
		start := 0
		for x := 1; x <= len(row); x++ {
			if x < len(row) && sameStyle(row[x], row[start]) {
				continue
			}
			var run strings.Builder
			for _, cl := range row[start:x] {
				run.WriteString(cl.char)
			}
			b.WriteString(styleOf(row[start]).Render(run.String()))
			start = x
		}
	}
	return b.String()
}

// PlainText renders the canvas without styles (for tests).
func (c *Canvas) PlainText() string {
	var b strings.Builder
	for y := 0; y < c.H; y++ {
		for _, cl := range c.cells[y*c.W : (y+1)*c.W] {
			b.WriteString(cl.char)
		}
		b.WriteByte('\n')
	}
	return b.String()
}

func sameStyle(a, b cell) bool { return a.fg == b.fg && a.bg == b.bg && a.attrs == b.attrs }

func styleOf(cl cell) lipgloss.Style {
	return lipgloss.NewStyle().
		Foreground(lipgloss.Color(hex(cl.fg))).
		Background(lipgloss.Color(hex(cl.bg))).
		Bold(cl.attrs.Bold).
		Faint(cl.attrs.Dim).
		Italic(cl.attrs.Italic).
		Underline(cl.attrs.Underline)
}

func hex(c Color) string {
	const digits = "0123456789abcdef"
	v := c.rgb()
	out := []byte("#000000")
	for i := 6; i >= 1; i-- {
		out[i] = digits[v&0xf]
		v >>= 4
	}
	return string(out)
}

// width is a grapheme's column width: emoji presentation (VS16) is always
// 2 columns, nothing is wider than 2.
func width(cluster string) int {
	if len(cluster) == 1 {
		if cluster[0] >= 0x20 && cluster[0] < 0x7f {
			return 1
		}
		return 0
	}
	if strings.Contains(cluster, "\ufe0f") {
		return 2
	}
	return min(uniseg.StringWidth(cluster), 2)
}

// textWidth is the column width of a string.
func textWidth(text string) int {
	w := 0
	g := uniseg.NewGraphemes(text)
	for g.Next() {
		w += width(g.Str())
	}
	return w
}

// truncate crops text to n columns, ending with an ellipsis when cut.
func truncate(text string, n int) string {
	if n <= 0 {
		return ""
	}
	if textWidth(text) <= n {
		return text
	}
	var b strings.Builder
	used := 0
	g := uniseg.NewGraphemes(text)
	for g.Next() {
		w := width(g.Str())
		if used+w > n-1 {
			break
		}
		b.WriteString(g.Str())
		used += w
	}
	return b.String() + "…"
}

// graphemes splits text into grapheme clusters.
func graphemes(text string) []string {
	var out []string
	g := uniseg.NewGraphemes(text)
	for g.Next() {
		out = append(out, g.Str())
	}
	return out
}
