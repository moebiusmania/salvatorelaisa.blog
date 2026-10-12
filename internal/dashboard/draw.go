package dashboard

import (
	"fmt"
	"strconv"
	"strings"

	tea "charm.land/bubbletea/v2"
)

func plural(n int, word string) string {
	if n == 1 {
		return fmt.Sprintf("%d %s", n, word)
	}
	return fmt.Sprintf("%d %ss", n, word)
}

func compact(n int) string {
	switch {
	case n < 1000:
		return strconv.Itoa(n)
	case n < 10_000:
		return strconv.FormatFloat(float64(n)/1000, 'f', 1, 64) + "k"
	default:
		return strconv.Itoa(round(float64(n)/1000)) + "k"
	}
}

func (m *Model) spinnerFrame() string {
	frames := []rune(spinner)
	return string(frames[m.frame%len(frames)])
}

func (m *Model) isHovered(id string) bool { return m.hover == id }

func (m *Model) buttonState(id string) buttonState {
	return buttonState{hovered: m.hover == id, focused: m.focus == id, pressed: m.pressed == id}
}

// render paints the whole frame and records its hit regions.
func (m *Model) render() *Canvas {
	width, height := m.width, m.height
	c := NewCanvas(width, height, palette.bg, palette.text)
	m.regions.reset()

	if width < 60 || height < 20 {
		lines := []string{"Terminal too small", fmt.Sprintf("%d×%d, needs at least 60×20", width, height), "q to quit"}
		for i, line := range lines {
			style := Style{FG: palette.muted}
			if i == 0 {
				style = Style{FG: palette.text, Bold: true}
			}
			c.Text(max(0, (width-textWidth(line))/2), height/2-1+i, line, style)
		}
		return c
	}

	s := m.stats
	m.drawHeader(c, width)

	statusY := height - 1
	tall := height >= 28
	actionsY := statusY - 2
	if tall {
		actionsY = statusY - 4
	}
	bigCards := height >= 34
	cardsHeight := 5
	if bigCards {
		cardsHeight = 7
	}
	y := 2
	m.drawCards(c, Rect{1, y, width - 2, cardsHeight}, bigCards)
	y += cardsHeight + 1

	leftWidth := (width - 3) / 2
	column := func(top, h int) (Rect, Rect) {
		return Rect{1, top, leftWidth, h}, Rect{leftWidth + 2, top, width - leftWidth - 3, h}
	}

	if available := actionsY - 1 - y; available >= 18 {
		chartHeight := clamp(round(float64(available)*0.45), 9, 14)
		left, right := column(y, chartHeight)
		m.drawYears(c, left)
		m.drawTags(c, right)
		y += chartHeight + 1
	}

	left, right := column(y, actionsY-1-y)
	var posts, drafts []PostInfo
	if s != nil {
		posts, drafts = s.Posts, s.Drafts
	}
	m.drawList(c, left, "recent", "Recent posts", "post", palette.accent, posts, "No posts yet")
	m.drawList(c, right, "drafts", "Drafts", "draft", palette.yellow, drafts, "No drafts, all caught up")

	m.drawActions(c, actionsY, width, tall)

	if m.modal != nil {
		m.drawModal(c, width, height)
	} else if m.now != nil {
		m.drawNow(c, width, height)
	}
	// After the modal so its key hints aren't dimmed with the rest.
	m.drawStatus(c, statusY, width)
	return c
}

func (m *Model) drawHeader(c *Canvas, width int) {
	c.Fill(Rect{0, 0, width, 1}, Style{BG: palette.surface})
	x := 1
	x += c.Text(x, 0, " ◆ ", Style{FG: palette.accent, Bold: true})
	x += c.Text(x, 0, "salvatorelaisa.blog", Style{FG: palette.text, Bold: true})
	c.Text(x+2, 0, "admin dashboard", Style{FG: palette.muted})

	theme := "…"
	if m.stats != nil {
		theme = m.stats.Theme
	}
	clock := m.clock().Format("Mon 2 Jan, 15:04")
	right := fmt.Sprintf("theme ● %s   %s ", theme, clock)
	if x+20+textWidth(right) > width {
		return
	}
	dot, ok := themeColors[theme]
	if !ok {
		dot = palette.muted
	}
	rx := width - 1 - textWidth(right)
	rx += c.Text(rx, 0, "theme ", Style{FG: palette.muted})
	rx += c.Text(rx, 0, "● ", Style{FG: dot})
	rx += c.Text(rx, 0, theme+"   ", Style{FG: palette.text})
	c.Text(rx, 0, clock, Style{FG: palette.muted})
}

func (m *Model) drawCards(c *Canvas, r Rect, big bool) {
	s := m.stats
	type card struct {
		label, value, sub string
		color             Color
	}
	cards := []card{
		{"POSTS", "-", "", palette.accent},
		{"DRAFTS", "-", "unpublished", palette.yellow},
		{"DEVICES", "-", "", palette.teal},
		{"BOOKS", "-", "", palette.violet},
		{"WORDS", "-", "", palette.blue},
		{"LAST POST", "-", "days ago", palette.green},
	}
	if s != nil {
		pinned := 0
		for _, p := range s.Posts {
			if p.Pinned {
				pinned++
			}
		}
		cards[0].value, cards[0].sub = strconv.Itoa(len(s.Posts)), fmt.Sprintf("%d pinned", pinned)
		cards[1].value = strconv.Itoa(len(s.Drafts))
		cards[2].value, cards[2].sub = strconv.Itoa(s.Devices.Visible), fmt.Sprintf("%d hidden", s.Devices.Hidden)
		cards[3].value, cards[3].sub = strconv.Itoa(s.Books.Visible), fmt.Sprintf("%d hidden", s.Books.Hidden)
		cards[4].value, cards[4].sub = compact(s.Words), fmt.Sprintf("≈ %dh reading", round(float64(s.ReadingTime)/60))
		if d := s.DaysSinceLastPost; d != nil {
			cards[5].value = strconv.Itoa(*d)
			switch *d {
			case 0:
				cards[5].sub = "today"
			case 1:
				cards[5].sub = "day ago"
			}
		}
	}

	count := 4
	if r.W >= 108 {
		count = 6
	} else if r.W >= 84 {
		count = 5
	}
	const gap = 1
	w := (r.W - gap*(count-1)) / count

	for i, card := range cards[:count] {
		x := r.X + i*(w+gap)
		cw := w
		// The last card absorbs the rounding remainder.
		if i == count-1 {
			cw = r.X + r.W - x
		}
		c.Fill(Rect{x, r.Y, cw, r.H}, Style{BG: palette.surface})
		for row := r.Y; row < r.Y+r.H; row++ {
			c.Text(x, row, "▌", Style{FG: card.color})
		}
		inner, room := x+3, cw-5
		c.Text(inner, r.Y+1, truncate(card.label, room), Style{FG: palette.muted, Bold: true})
		glyphs := bigText(card.value)
		if big && textWidth(glyphs[0]) <= room {
			for row, line := range glyphs {
				c.Text(inner, r.Y+2+row, line, Style{FG: card.color})
			}
			c.Text(inner, r.Y+5, truncate(card.sub, room), Style{FG: palette.faint})
		} else {
			c.Text(inner, r.Y+2, truncate(card.value, room), Style{FG: card.color, Bold: true})
			c.Text(inner, r.Y+3, truncate(card.sub, room), Style{FG: palette.faint})
		}
	}
}

func (m *Model) drawYears(c *Canvas, r Rect) {
	var all []yearCount
	total := 0
	if m.stats != nil {
		all, total = m.stats.PerYear, len(m.stats.Posts)
	}
	info := ""
	for _, y := range all {
		if m.isHovered(fmt.Sprintf("year:%d", y.Year)) {
			info = fmt.Sprintf("%d · %s", y.Year, plural(y.Count, "post"))
		}
	}
	if info == "" && len(all) > 0 {
		info = fmt.Sprintf("%s since %d", plural(total, "post"), all[0].Year)
	}
	inner := panel(c, r, panelOptions{title: "Posts per year", color: palette.accent, info: info})
	if len(all) == 0 || inner.H < 3 {
		return
	}

	// Most recent years win when there isn't room for all of them.
	years := all
	slot := inner.W / len(years)
	if slot < 2 {
		years = all[max(0, len(all)-inner.W/2):]
		slot = 2
	}
	slot = min(slot, 6)
	barWidth := max(1, slot-1)
	chartWidth := slot*len(years) - (slot - barWidth)
	x0 := inner.X + (inner.W-chartWidth)/2
	barRows := inner.H - 1
	bottom := inner.Y + barRows - 1
	labelY := inner.Y + inner.H - 1
	maxCount := 1
	for _, y := range years {
		maxCount = max(maxCount, y.Count)
	}
	labelWidth := 2
	if slot >= 5 {
		labelWidth = 4
	}
	step := (labelWidth + 1 + slot - 1) / slot

	for i, y := range years {
		id := fmt.Sprintf("year:%d", y.Year)
		x := x0 + i*slot
		active := m.isHovered(id)
		ratio := float64(y.Count) / float64(maxCount)

		if active {
			c.Fill(Rect{x, inner.Y, barWidth, barRows}, Style{BG: palette.surfaceHi})
		}
		if y.Count == 0 {
			c.Text(x, bottom, strings.Repeat("▁", barWidth), Style{FG: palette.border})
		} else {
			color := mix(palette.borderHi, palette.accent, 0.35+0.65*ratio)
			if active {
				color = palette.accentHi
			}
			vbar(c, x, bottom, barWidth, barRows, ratio, color)
		}
		if active || (len(years)-1-i)%step == 0 {
			label := strconv.Itoa(y.Year)
			label = label[len(label)-labelWidth:]
			style := Style{FG: palette.faint}
			if active {
				style = Style{FG: palette.text, Bold: true}
			}
			c.Text(x+(barWidth-labelWidth)/2, labelY, label, style)
		}
		m.regions.add(Region{ID: id, Rect: Rect{x, inner.Y, slot, inner.H}})
	}
}

func (m *Model) drawTags(c *Canvas, r Rect) {
	var tags []tagCount
	if m.stats != nil {
		tags = m.stats.Tags
	}
	info := ""
	for _, t := range tags {
		if m.isHovered("tag:" + t.Tag) {
			info = fmt.Sprintf("%s · %s", t.Tag, plural(t.Count, "post"))
		}
	}
	if info == "" && len(tags) > 0 {
		info = plural(len(tags), "tag")
	}
	inner := panel(c, r, panelOptions{title: "Top tags", color: palette.teal, info: info})
	shown := tags[:min(len(tags), max(0, inner.H))]
	if len(shown) == 0 {
		return
	}

	maxCount := shown[0].Count
	nameWidth := 0
	for _, t := range shown {
		nameWidth = max(nameWidth, textWidth(t.Tag))
	}
	nameWidth = min(16, nameWidth)
	barMax := inner.W - nameWidth - len(strconv.Itoa(maxCount)) - 2

	for i, t := range shown {
		id := "tag:" + t.Tag
		y := inner.Y + i
		active := m.isHovered(id)
		ratio := float64(t.Count) / float64(maxCount)
		if active {
			c.Fill(Rect{inner.X - 1, y, inner.W + 2, 1}, Style{BG: palette.surfaceHi})
		}
		name := Style{FG: palette.muted}
		bar := mix(palette.borderHi, palette.teal, 0.4+0.6*ratio)
		count := Style{FG: palette.faint}
		if active {
			name = Style{FG: palette.text, Bold: true}
			bar = lighten(palette.teal, 0.25)
			count = Style{FG: palette.text}
		}
		c.Text(inner.X, y, truncate(t.Tag, nameWidth), name)
		length := hbar(c, inner.X+nameWidth+1, y, barMax, ratio, bar)
		c.Text(inner.X+nameWidth+1+length+1, y, strconv.Itoa(t.Count), count)
		m.regions.add(Region{ID: id, Rect: Rect{inner.X - 1, y, inner.W + 2, 1}})
	}
}

func (m *Model) drawList(c *Canvas, r Rect, key, title, noun string, color Color, items []PostInfo, empty string) {
	o := panelOptions{title: title, color: color}
	if len(items) > 0 {
		o.info = plural(len(items), noun)
	}
	if len(items) > r.H-2 {
		o.footer = "wheel to scroll"
	}
	inner := panel(c, r, o)
	m.listRows[key] = inner.H
	m.regions.add(Region{ID: "list:" + key, Rect: r, OnWheel: func(delta int) { m.scrollList(key, delta*2) }})

	if len(items) == 0 {
		c.Text(inner.X, inner.Y, empty, Style{FG: palette.faint, Italic: true})
		return
	}

	offset := clamp(m.scroll[key], 0, max(0, len(items)-inner.H))
	// Fixed-width columns so titles line up; dates go first when space is short.
	showDate := inner.W >= 44
	metaWidth := 0
	for _, p := range items {
		metaWidth = max(metaWidth, len(strconv.Itoa(p.ReadingTime))+4)
	}
	for i, p := range items[offset:min(len(items), offset+inner.H)] {
		id := "row:" + key + ":" + p.Slug
		y := inner.Y + i
		active := m.isHovered(id)
		if active {
			c.Fill(Rect{inner.X - 1, y, inner.W + 2, 1}, Style{BG: palette.surfaceHi})
		}
		x := inner.X
		if showDate {
			date := "no date   "
			if p.Date != nil {
				date = p.Date.Format("2006-01-02")
			}
			x += c.Text(x, y, date, Style{FG: palette.faint}) + 2
		}
		meta := fmt.Sprintf("%*s", metaWidth, fmt.Sprintf("%d min", p.ReadingTime))
		room := inner.X + inner.W - x - metaWidth - 2
		if p.Pinned {
			x += c.Text(x, y, "★ ", Style{FG: palette.yellow})
			room -= 2
		}
		titleStyle, metaStyle := Style{FG: palette.text}, Style{FG: palette.faint}
		if active {
			titleStyle, metaStyle = Style{FG: palette.white, Bold: true}, Style{FG: palette.muted}
		}
		c.Text(x, y, truncate(p.Title, room), titleStyle)
		c.Text(inner.X+inner.W-metaWidth, y, meta, metaStyle)
		m.regions.add(Region{ID: id, Rect: Rect{inner.X - 1, y, inner.W + 2, 1}})
	}
	scrollbar(c, r, offset, inner.H, len(items))
}

func (m *Model) drawActions(c *Canvas, y, width int, tall bool) {
	compactLabels := width < 96
	x := 2
	for _, k := range kinds {
		id := "action:" + k.id
		label := "+ New " + k.noun
		if compactLabels {
			label = "+ " + k.short
		}
		x += button(c, &m.regions, buttonOptions{
			id: id, x: x, y: y, label: label, color: k.color, on: palette.bg, tall: tall,
			state:   m.buttonState(id),
			onClick: func() tea.Cmd { m.openModal(k); return nil },
		}) + 2
	}

	extra := []struct {
		id, label, short string
		run              func() tea.Cmd
	}{
		{"action:now", "◷ Now", "◷", m.openNow},
		{"action:refresh", "↻ Refresh", "↻", m.reload},
		{"action:quit", "✕ Quit", "✕", func() tea.Cmd { return tea.Quit }},
	}
	extraWidth := 0
	for i := range extra {
		if compactLabels {
			extra[i].label = extra[i].short
		}
		extraWidth += buttonWidth(extra[i].label) + 2
	}
	rx := width - extraWidth
	if rx < x {
		return
	}
	for _, b := range extra {
		rx += button(c, &m.regions, buttonOptions{
			id: b.id, x: rx, y: y, label: b.label, color: palette.surfaceHi, textColor: palette.text,
			on: palette.bg, tall: tall, state: m.buttonState(b.id), onClick: b.run,
		}) + 2
	}
}

func (m *Model) drawStatus(c *Canvas, y, width int) {
	c.Fill(Rect{0, y, width, 1}, Style{BG: palette.surface})

	// Right side: toast, loading state or last refresh.
	right, rightStyle := "", Style{FG: palette.faint}
	switch {
	case m.toast != nil:
		mark, color := "✓", palette.green
		if !m.toast.ok {
			mark, color = "✗", palette.accent
		}
		right, rightStyle = mark+" "+m.toast.text, Style{FG: color, Bold: true}
	case m.loadErr != "":
		right, rightStyle = "✗ "+m.loadErr, Style{FG: palette.accent}
	case m.loading:
		right, rightStyle = m.spinnerFrame()+" loading", Style{FG: palette.muted}
	case !m.updatedAt.IsZero():
		right = "updated " + m.updatedAt.Format("15:04:05")
	}
	right = truncate(right, width/2)
	rightWidth := textWidth(right)
	if right != "" {
		c.Text(width-1-rightWidth, y, right, rightStyle)
	}
	room := width - rightWidth - 4

	// Left side: details of the hovered post, or keyboard hints.
	if strings.HasPrefix(m.hover, "row:") && m.stats != nil {
		for _, p := range append(append([]PostInfo{}, m.stats.Posts...), m.stats.Drafts...) {
			if strings.HasSuffix(m.hover, ":"+p.Slug) {
				tags := strings.Join(nonEmpty(p.Tags), ", ")
				if tags == "" {
					tags = "no tags"
				}
				text := fmt.Sprintf("content/%s.md  ·  %s  ·  %s", p.Slug, tags, plural(p.Words, "word"))
				c.Text(1, y, truncate(text, room), Style{FG: palette.muted})
				return
			}
		}
	}

	hints := [][2]string{{"1 2 3", "new"}, {"n", "now"}, {"r", "refresh"}, {"tab ⏎", "keyboard"}, {"q", "quit"}}
	if m.modal != nil {
		hints = [][2]string{{"⏎", "create"}, {"esc", "cancel"}, {"tab", "focus"}}
	} else if m.now != nil {
		hints = [][2]string{{"esc", "close"}, {"↑ ↓", "scroll"}}
	}
	x := 1
	for _, h := range hints {
		if x+textWidth(h[0]+" "+h[1]+"   ") > room {
			break
		}
		x += c.Text(x, y, h[0], Style{FG: palette.text, Bold: true})
		x += c.Text(x, y, " "+h[1]+"   ", Style{FG: palette.faint})
	}
}

func nonEmpty(list []string) []string {
	var out []string
	for _, s := range list {
		if s != "" {
			out = append(out, s)
		}
	}
	return out
}

func (m *Model) drawInput(c *Canvas, field Rect, focused bool) {
	md := m.modal
	bg, bar := palette.bg, palette.border
	if focused {
		bg, bar = palette.surfaceHi, md.kind.color
	}
	c.Fill(field, Style{BG: bg})
	c.Text(field.X, field.Y, "▎", Style{FG: bar})

	x0, room := field.X+2, field.W-3
	widths := make([]int, len(md.chars))
	for i, ch := range md.chars {
		widths[i] = textWidth(ch)
	}
	span := func(from, to int) int {
		w := 0
		for _, cw := range widths[from:to] {
			w += cw
		}
		return w
	}

	// Scroll horizontally just enough to keep the cursor in view.
	m.inputScroll = min(m.inputScroll, md.cursor)
	for span(m.inputScroll, md.cursor)+1 > room {
		m.inputScroll++
	}

	if len(md.chars) == 0 {
		c.Text(x0, field.Y, truncate("e.g. "+md.kind.example, room), Style{FG: palette.faint, Italic: true})
	}
	x := x0
	for i := m.inputScroll; i < len(md.chars); i++ {
		if x-x0+widths[i] > room {
			break
		}
		x += c.Text(x, field.Y, md.chars[i], Style{FG: palette.text})
	}
	if focused {
		char := " "
		if md.cursor < len(md.chars) {
			char = md.chars[md.cursor]
		}
		c.Text(x0+span(m.inputScroll, md.cursor), field.Y, char, Style{FG: palette.bg, BG: palette.text})
	}

	scroll := m.inputScroll
	m.regions.add(Region{
		ID: "modal:input", Rect: field, Focusable: true,
		// Clicking in the field moves the cursor under the pointer.
		OnPress: func(px, _ int) {
			column, index := x0, scroll
			for index < len(md.chars) && column+widths[index] <= px {
				column += widths[index]
				index++
			}
			m.edit(func(chars []string, _ int) ([]string, int) { return chars, index })
		},
	})
}

// backdrop dims everything painted so far and blocks it with a region.
func (m *Model) backdrop(c *Canvas, width, height int, onClick func() tea.Cmd) {
	c.MapColors(func(color Color) Color { return mix(color, palette.black, 0.55) })
	m.regions.layer = 1
	m.regions.add(Region{ID: "modal:backdrop", Rect: Rect{0, 0, width, height}, OnClick: onClick})
}

func (m *Model) drawModal(c *Canvas, width, height int) {
	md := m.modal
	m.backdrop(c, width, height, func() tea.Cmd { m.closeModal(); return nil })

	w, h := min(66, width-4), 11
	x, y := (width-w)/2, (height-h)/2
	c.Fill(Rect{x + 2, y + 1, w, h}, Style{BG: shadow})
	inner := panel(c, Rect{x, y, w, h}, panelOptions{
		title: "New " + md.kind.noun, color: md.kind.color, border: palette.borderHi, footer: md.kind.command,
	})
	// Swallows clicks inside the box so they don't reach the backdrop.
	m.regions.add(Region{ID: "modal:box", Rect: Rect{x, y, w, h}})

	c.Text(inner.X, inner.Y+1, "Title", Style{FG: palette.muted, Bold: true})
	m.drawInput(c, Rect{inner.X, inner.Y + 2, inner.W, 1}, m.focus == "modal:input")

	t := m.target()
	message, color := "→ "+md.kind.Folder+"/…", palette.faint
	switch {
	case md.err != "":
		message, color = "✗ "+md.err, palette.accent
	case t.exists:
		message, color = "⚠ "+t.path+" already exists", palette.yellow
	case t.path != "":
		message = "→ " + t.path
	}
	c.Text(inner.X, inner.Y+3, truncate(message, inner.W), Style{FG: color})

	valid := t.path != "" && !t.exists
	createX := inner.X + inner.W - buttonWidth("Create")
	cancelX := createX - 2 - buttonWidth("Cancel")
	buttonY := inner.Y + 5
	button(c, &m.regions, buttonOptions{
		id: "modal:cancel", x: cancelX, y: buttonY, label: "Cancel", color: palette.surfaceHi,
		textColor: palette.text, on: palette.surface, tall: true, state: m.buttonState("modal:cancel"),
		onClick: func() tea.Cmd { m.closeModal(); return nil },
	})
	face, label := palette.border, palette.muted
	if valid {
		face, label = md.kind.color, palette.white
	}
	button(c, &m.regions, buttonOptions{
		id: "modal:create", x: createX, y: buttonY, label: "Create", color: face, textColor: label,
		on: palette.surface, tall: true, state: m.buttonState("modal:create"), onClick: m.submit,
	})
}

type segment struct {
	text  string
	style Style
}

type line []segment

func (m *Model) nowLines(n *nowView, room int) []line {
	heading := func(text string, color Color) line {
		return line{{strings.ToUpper(text), Style{FG: color, Bold: true}}}
	}
	plain := func(text string, s Style) line { return line{{"  " + truncate(text, room-2), s}} }
	muted := Style{FG: palette.faint, Italic: true}
	d := n.data

	lines := []line{
		heading("Work", palette.accent),
		plain(d.Work.Role, Style{FG: palette.white, Bold: true}),
		plain(d.Work.Company+" · "+d.Work.City, Style{FG: palette.muted}),
		{},
		heading("Weather", palette.blue),
	}
	switch n.weatherStatus {
	case okStatus:
		w := n.weather
		lines = append(lines, line{
			{fmt.Sprintf("  %d°C", w.Temperature), Style{FG: palette.white, Bold: true}},
			{truncate("  "+w.Label+" · "+w.City, room-6), Style{FG: palette.muted}},
		})
	case loadingStatus:
		lines = append(lines, plain(m.spinnerFrame()+" loading "+d.WeatherLocation+"…", muted))
	default:
		lines = append(lines, plain("Weather unavailable for "+d.WeatherLocation, muted))
	}

	lines = append(lines, line{}, heading("Watching", palette.violet))
	watched := d.Watched()
	if len(watched) == 0 {
		lines = append(lines, plain("Nothing right now", muted))
	}
	for _, w := range watched {
		lines = append(lines, line{
			{fmt.Sprintf("  %-8s", w.Type), Style{FG: palette.faint}},
			{truncate(w.Label, room-10), Style{FG: palette.text}},
		})
	}

	lines = append(lines, line{}, heading("Next event", palette.green), plain(d.Event.Name, Style{FG: palette.text, Bold: true}))
	if d.Event.Date != "" {
		lines = append(lines, plain(d.Event.Date, Style{FG: palette.muted}))
	}

	lines = append(lines, line{}, heading("GitHub · "+d.GithubUser, palette.teal))
	switch {
	case n.reposStatus == loadingStatus:
		lines = append(lines, plain(m.spinnerFrame()+" loading repositories…", muted))
	case n.reposStatus == errorStatus:
		lines = append(lines, plain("Repositories unavailable", muted))
	case len(n.repos) == 0:
		lines = append(lines, plain("No public repositories", muted))
	}
	if n.reposStatus == okStatus {
		for _, repo := range n.repos {
			language := ""
			if repo.Language != "" {
				language = "  " + repo.Language
			}
			lines = append(lines, line{
				{"  " + truncate(repo.Name, room-2-textWidth(language)), Style{FG: palette.text, Bold: true}},
				{language, Style{FG: palette.faint}},
			})
			if repo.Description != "" {
				lines = append(lines, plain("  "+repo.Description, Style{FG: palette.muted}))
			}
		}
	}
	return lines
}

func (m *Model) drawNow(c *Canvas, width, height int) {
	m.backdrop(c, width, height, func() tea.Cmd { m.closeNow(); return nil })

	w := min(72, width-4)
	lines := m.nowLines(m.now, w-4)
	// Border (2) + gap above the button (1) + tall button (3).
	h := min(len(lines)+6, height-4)
	x, y := (width-w)/2, (height-h)/2
	c.Fill(Rect{x + 2, y + 1, w, h}, Style{BG: shadow})
	inner := panel(c, Rect{x, y, w, h}, panelOptions{
		title: "Now", color: palette.blue, border: palette.borderHi, info: "/now", footer: "data/now.yaml",
	})
	m.regions.add(Region{ID: "modal:box", Rect: Rect{x, y, w, h}, OnWheel: func(delta int) { m.scrollNow(delta * 2) }})

	m.nowRows, m.nowTotal = inner.H-4, len(lines)
	offset := clamp(m.nowScroll, 0, max(0, len(lines)-m.nowRows))
	for i, l := range lines[offset:min(len(lines), offset+max(0, m.nowRows))] {
		lx := inner.X
		for _, seg := range l {
			lx += c.Text(lx, inner.Y+i, seg.text, seg.style)
		}
	}
	scrollbar(c, Rect{x, inner.Y - 1, w, m.nowRows + 2}, offset, m.nowRows, len(lines))

	button(c, &m.regions, buttonOptions{
		id: "now:close", x: inner.X + inner.W - buttonWidth("Close"), y: inner.Y + inner.H - 3,
		label: "Close", color: palette.surfaceHi, textColor: palette.text, on: palette.surface, tall: true,
		state: m.buttonState("now:close"), onClick: func() tea.Cmd { m.closeNow(); return nil },
	})
}
