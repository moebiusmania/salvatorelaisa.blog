package dashboard

import (
	tea "charm.land/bubbletea/v2"
	"math"
	"strings"
)

// Drawing primitives shared by the dashboard views. Widgets paint into the
// canvas and register hit regions for the mouse.

// Region is a clickable/hoverable area registered while painting a frame.
type Region struct {
	ID   string
	Rect Rect
	// Layer: higher layers (modals) shadow everything below them.
	Layer     int
	Focusable bool
	// OnPress runs on mouse down, with the pointer position.
	OnPress func(x, y int)
	// OnClick runs on mouse up over the same region, or Enter/Space while
	// focused.
	OnClick func() tea.Cmd
	OnWheel func(delta int)
}

// Regions are the hit regions of the last frame, in paint order.
type Regions struct {
	list  []Region
	layer int
}

func (r *Regions) reset() { r.list, r.layer = r.list[:0], 0 }

func (r *Regions) add(region Region) {
	region.Layer = r.layer
	r.list = append(r.list, region)
}

func (r *Regions) top() int {
	top := 0
	for _, region := range r.list {
		top = max(top, region.Layer)
	}
	return top
}

// at is the topmost region under the pointer that satisfies filter.
func (r *Regions) at(x, y int, filter func(Region) bool) *Region {
	top := r.top()
	for i := len(r.list) - 1; i >= 0; i-- {
		region := &r.list[i]
		if region.Layer == top && region.Rect.contains(x, y) && (filter == nil || filter(*region)) {
			return region
		}
	}
	return nil
}

func (r *Regions) byID(id string) *Region {
	for i := range r.list {
		if r.list[i].ID == id {
			return &r.list[i]
		}
	}
	return nil
}

// focusables are the focusable ids of the topmost layer, in paint order.
func (r *Regions) focusables() []string {
	top := r.top()
	var ids []string
	for _, region := range r.list {
		if region.Layer == top && region.Focusable {
			ids = append(ids, region.ID)
		}
	}
	return ids
}

type panelOptions struct {
	title  string
	color  Color  // dot next to the title
	info   string // right-aligned in the top border
	footer string // hint in the bottom border
	border Color
}

// panel draws a rounded bordered box and returns its padded content area.
func panel(c *Canvas, r Rect, o panelOptions) Rect {
	bg := palette.surface
	border := Style{FG: o.border, BG: bg}
	if border.FG == 0 {
		border.FG = palette.border
	}
	c.Fill(r, Style{BG: bg, FG: palette.text})
	c.Text(r.X, r.Y, "╭"+strings.Repeat("─", max(0, r.W-2))+"╮", border)
	c.Text(r.X, r.Y+r.H-1, "╰"+strings.Repeat("─", max(0, r.W-2))+"╯", border)
	for row := r.Y + 1; row < r.Y+r.H-1; row++ {
		c.Text(r.X, row, "│", border)
		c.Text(r.X+r.W-1, row, "│", border)
	}

	c.Text(r.X+2, r.Y, " ● ", Style{FG: o.color, BG: bg})
	titleWidth := c.Text(r.X+5, r.Y, truncate(o.title, r.W-8)+" ", Style{FG: palette.text, BG: bg, Bold: true})

	if o.info != "" {
		room := r.W - 5 - titleWidth - 4
		if info := truncate(o.info, room-2); info != "" && room > 4 {
			c.Text(r.X+r.W-3-textWidth(info)-1, r.Y, " "+info+" ", Style{FG: palette.muted, BG: bg})
		}
	}
	if o.footer != "" && textWidth(o.footer)+6 < r.W {
		c.Text(r.X+r.W-4-textWidth(o.footer), r.Y+r.H-1, " "+o.footer+" ", Style{FG: palette.faint, BG: bg})
	}
	return inset(r, 2, 1)
}

// scrollbar draws a thumb over the panel's right border when content overflows.
func scrollbar(c *Canvas, r Rect, offset, visible, total int) {
	if total <= visible || visible <= 0 {
		return
	}
	track := r.H - 2
	size := max(1, round(float64(visible)/float64(total)*float64(track)))
	start := round(float64(offset) / float64(total-visible) * float64(track-size))
	for i := 0; i < size; i++ {
		c.Text(r.X+r.W-1, r.Y+1+start+i, "┃", Style{FG: palette.muted})
	}
}

type buttonState struct{ hovered, focused, pressed bool }

type buttonOptions struct {
	id        string
	x, y      int
	label     string
	color     Color // face
	textColor Color
	on        Color // background the button sits on, for the half-block caps
	tall      bool  // three rows with half-block caps instead of one
	state     buttonState
	onClick   func() tea.Cmd
}

func buttonWidth(label string) int { return textWidth(label) + 6 }

func button(c *Canvas, regions *Regions, o buttonOptions) int {
	w := buttonWidth(o.label)
	face := o.color
	switch {
	case o.state.pressed:
		face = darken(o.color, 0.25)
	case o.state.hovered:
		face = lighten(o.color, 0.18)
	case o.state.focused:
		face = lighten(o.color, 0.1)
	}
	mid := o.y
	if o.tall {
		mid = o.y + 1
		c.Text(o.x, o.y, strings.Repeat("▄", w), Style{FG: face, BG: o.on})
		c.Text(o.x, o.y+2, strings.Repeat("▀", w), Style{FG: face, BG: o.on})
	}
	c.Fill(Rect{o.x, mid, w, 1}, Style{BG: face})
	text := o.textColor
	if text == 0 {
		text = palette.white
	}
	c.Text(o.x+3, mid, o.label, Style{
		FG: text, BG: face,
		Bold: o.state.hovered || o.state.focused,
		// Keyboard focus stays visible even when the mouse is elsewhere.
		Underline: o.state.focused,
	})
	h := 1
	if o.tall {
		h = 3
	}
	regions.add(Region{ID: o.id, Rect: Rect{o.x, o.y, w, h}, Focusable: true, OnClick: o.onClick})
	return w
}

// 3-row block font for the big numbers on the stat cards.
var font = map[rune][3]string{
	'0': {"█▀█", "█ █", "▀▀▀"},
	'1': {"▀█ ", " █ ", "▀▀▀"},
	'2': {"▀▀█", "█▀▀", "▀▀▀"},
	'3': {"▀▀█", " ▀█", "▀▀▀"},
	'4': {"█ █", "▀▀█", "  ▀"},
	'5': {"█▀▀", "▀▀█", "▀▀▀"},
	'6': {"█▀▀", "█▀█", "▀▀▀"},
	'7': {"▀▀█", "  █", "  ▀"},
	'8': {"█▀█", "█▀█", "▀▀▀"},
	'9': {"█▀█", "▀▀█", "▀▀▀"},
	'k': {"█  ", "█▄▀", "▀ ▀"},
	'.': {" ", " ", "▀"},
	'-': {"   ", "▀▀▀", "   "},
}

// bigText renders text in the block font; unknown characters are skipped.
func bigText(text string) [3]string {
	var rows [3][]string
	for _, r := range text {
		if glyph, ok := font[r]; ok {
			for i := range rows {
				rows[i] = append(rows[i], glyph[i])
			}
		}
	}
	return [3]string{strings.Join(rows[0], " "), strings.Join(rows[1], " "), strings.Join(rows[2], " ")}
}

const (
	eighthsUp    = " ▁▂▃▄▅▆▇█"
	eighthsRight = " ▏▎▍▌▋▊▉█"
)

func eighth(set string, n int) string { return string([]rune(set)[min(8, n)]) }

// vbar draws a vertical bar up to height rows, filled to ratio in eighths.
func vbar(c *Canvas, x, bottom, w, height int, ratio float64, fg Color) {
	eighths := round(ratio * float64(height) * 8)
	// Non-zero values always show at least a sliver.
	if ratio > 0 && eighths == 0 {
		eighths = 1
	}
	for row := 0; row < height && eighths > 0; row++ {
		c.Text(x, bottom-row, strings.Repeat(eighth(eighthsUp, eighths), w), Style{FG: fg})
		eighths -= 8
	}
}

// hbar draws a horizontal bar up to w columns, filled to ratio in eighths,
// and returns its width.
func hbar(c *Canvas, x, y, w int, ratio float64, fg Color) int {
	eighths := round(ratio * float64(w) * 8)
	if ratio > 0 {
		eighths = max(1, eighths)
	}
	var bar strings.Builder
	for ; eighths > 0; eighths -= 8 {
		bar.WriteString(eighth(eighthsRight, eighths))
	}
	c.Text(x, y, bar.String(), Style{FG: fg})
	return textWidth(bar.String())
}

// round is JavaScript's Math.round (halves go up).
func round(v float64) int { return int(math.Floor(v + 0.5)) }

func clamp(n, lo, hi int) int { return max(lo, min(hi, n)) }
