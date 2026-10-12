// Package dashboard is the admin TUI (`blog dashboard`): content stats,
// charts, recent posts and drafts, buttons to scaffold new content and a
// panel with the live /now data.
//
// It's a Bubble Tea program that paints every frame from scratch into a cell
// canvas (so modals can dim what's behind them) and keeps the hit regions of
// the last frame for the mouse.
package dashboard

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	tea "charm.land/bubbletea/v2"
	"github.com/fsnotify/fsnotify"

	"salvatorelaisa.blog/internal/now"
	"salvatorelaisa.blog/internal/scaffold"
)

type kind struct {
	scaffold.Kind
	id      string
	noun    string // in "New …" labels and the modal title
	short   string
	command string // shown in the modal footer
	color   Color
	key     string
	example string
}

var kinds = []kind{
	{scaffold.Post, "post", "post", "Post", "blog new post", palette.accent, "1", "Il mio nuovo post"},
	{scaffold.Device, "device", "device card", "Device", "blog new device", palette.teal, "2", "Steam Deck OLED"},
	{scaffold.Book, "book", "book", "Book", "blog new book", palette.violet, "3", "Il barone rampante"},
}

const (
	spinner  = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
	maxTitle = 200
)

type modal struct {
	kind kind
	// The title as grapheme clusters, so the cursor never splits a character.
	chars  []string
	cursor int
	err    string
}

type status int

const (
	loadingStatus status = iota
	okStatus
	errorStatus
)

type nowView struct {
	data          now.Data
	weather       now.Weather
	weatherStatus status
	repos         []now.Repo
	reposStatus   status
}

type toast struct {
	text string
	ok   bool
	id   int
}

// Messages.
type (
	statsMsg struct {
		stats *Stats
		err   error
	}
	clockMsg       time.Time
	spinMsg        struct{}
	toastDoneMsg   int
	fileChangedMsg struct{}
	weatherMsg     struct {
		token   int
		weather now.Weather
		err     error
	}
	reposMsg struct {
		token int
		repos []now.Repo
		err   error
	}
)

// Model is the dashboard state.
type Model struct {
	root   string
	clock  func() time.Time
	client now.Client
	codes  now.Codes
	// changes delivers debounced content changes (nil: not watching).
	changes <-chan struct{}

	width, height int
	stats         *Stats
	loadErr       string
	loading       bool
	reloadAgain   bool
	updatedAt     time.Time

	hover, pressed, focus string
	modal                 *modal
	now                   *nowView
	nowScroll             int
	// nowToken is bumped on every open/close, so late fetches are dropped.
	nowToken    int
	returnFocus string
	toast       *toast
	scroll      map[string]int
	frame       int
	spinning    bool

	// Bits of the last frame the input handlers need.
	regions        Regions
	listRows       map[string]int
	inputScroll    int
	nowRows        int
	nowTotal       int
	mouseX, mouseY int
}

// New makes a dashboard for the repository at root.
func New(root string) *Model {
	return &Model{
		root:     root,
		clock:    time.Now,
		client:   now.NewClient(&http.Client{Timeout: 15 * time.Second}),
		width:    80,
		height:   24,
		focus:    "action:post",
		scroll:   map[string]int{"recent": 0, "drafts": 0},
		listRows: map[string]int{},
		mouseX:   -1,
		mouseY:   -1,
	}
}

// Run starts the dashboard in the terminal until the user quits.
func Run(root string) error {
	m := New(root)
	changes, stop, err := watch(root)
	if err == nil {
		defer stop()
		m.changes = changes
	}
	_, err = tea.NewProgram(m).Run()
	return err
}

// watch reports changes under content/ and to hugo.toml, debounced. Watching
// is a nicety: the refresh button still works without it.
func watch(root string) (<-chan struct{}, func(), error) {
	w, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, nil, err
	}
	filepath.WalkDir(filepath.Join(root, "content"), func(path string, d os.DirEntry, err error) error {
		if err == nil && d.IsDir() {
			w.Add(path)
		}
		return nil
	})
	w.Add(filepath.Join(root, "hugo.toml"))

	out := make(chan struct{}, 1)
	go func() {
		var timer *time.Timer
		for {
			select {
			case _, ok := <-w.Events:
				if !ok {
					return
				}
				if timer != nil {
					timer.Stop()
				}
				timer = time.AfterFunc(200*time.Millisecond, func() {
					select {
					case out <- struct{}{}:
					default:
					}
				})
			case _, ok := <-w.Errors:
				if !ok {
					return
				}
			}
		}
	}()
	return out, func() { w.Close() }, nil
}

func (m *Model) waitForChange() tea.Cmd {
	if m.changes == nil {
		return nil
	}
	return func() tea.Msg {
		if _, ok := <-m.changes; !ok {
			return nil
		}
		return fileChangedMsg{}
	}
}

func tickClock() tea.Cmd {
	return tea.Every(time.Second, func(t time.Time) tea.Msg { return clockMsg(t) })
}

// Init loads the stats and starts the clock and the file watcher.
func (m *Model) Init() tea.Cmd {
	return tea.Batch(m.reload(), tickClock(), m.waitForChange())
}

// --- actions -------------------------------------------------------------------

func (m *Model) reload() tea.Cmd {
	if m.loading {
		m.reloadAgain = true
		return nil
	}
	m.loading = true
	root, at := m.root, m.clock()
	return func() tea.Msg {
		s, err := LoadStats(root, at)
		return statsMsg{s, err}
	}
}

func (m *Model) notify(text string, ok bool) tea.Cmd {
	id := 1
	if m.toast != nil {
		id = m.toast.id + 1
	}
	m.toast = &toast{text, ok, id}
	return tea.Tick(6*time.Second, func(time.Time) tea.Msg { return toastDoneMsg(id) })
}

func (m *Model) openModal(k kind) {
	if m.modal != nil {
		return
	}
	m.returnFocus = m.focus
	m.inputScroll = 0
	m.modal = &modal{kind: k}
	m.focus = "modal:input"
	m.pressed = ""
}

func (m *Model) closeModal() {
	if m.modal == nil {
		return
	}
	m.modal = nil
	m.focus = m.returnFocus
	m.pressed = ""
}

func (m *Model) openNow() tea.Cmd {
	if m.modal != nil || m.now != nil {
		return nil
	}
	// Read on every open, so edits to the YAML show up without a restart.
	data, codes, err := now.Load(m.root)
	if err != nil {
		return m.notify("Could not load data/now.yaml: "+err.Error(), false)
	}
	m.codes = codes
	m.nowToken++
	token := m.nowToken
	m.returnFocus = m.focus
	m.nowScroll = 0
	m.now = &nowView{data: data}
	m.focus = "now:close"
	m.pressed = ""

	client := m.client
	return tea.Batch(
		func() tea.Msg {
			w, err := client.Weather(context.Background(), data.WeatherLocation, codes)
			return weatherMsg{token, w, err}
		},
		func() tea.Msg {
			repos, err := client.Repos(context.Background(), data.GithubUser, 3)
			return reposMsg{token, repos, err}
		},
	)
}

func (m *Model) closeNow() {
	if m.now == nil {
		return
	}
	m.nowToken++
	m.now = nil
	m.focus = m.returnFocus
	m.pressed = ""
}

func (m *Model) scrollNow(delta int) {
	m.nowScroll = clamp(m.nowScroll+delta, 0, max(0, m.nowTotal-m.nowRows))
}

// edit applies a change to the title; any edit clears the previous error.
func (m *Model) edit(fn func(chars []string, cursor int) ([]string, int)) {
	if m.modal == nil {
		return
	}
	chars, cursor := fn(m.modal.chars, m.modal.cursor)
	if len(chars) > maxTitle {
		chars = chars[:maxTitle]
	}
	m.modal.chars = chars
	m.modal.cursor = clamp(cursor, 0, len(chars))
	m.modal.err = ""
}

func (m *Model) insert(text string) {
	var added []string
	for _, g := range graphemes(text) {
		if g >= " " {
			added = append(added, g)
		}
	}
	m.edit(func(chars []string, cursor int) ([]string, int) {
		out := append(append(append([]string{}, chars[:cursor]...), added...), chars[cursor:]...)
		return out, cursor + len(added)
	})
}

func (m *Model) deleteRange(from, to int) {
	m.edit(func(chars []string, cursor int) ([]string, int) {
		start := clamp(min(from, to), 0, len(chars))
		end := clamp(max(from, to), 0, len(chars))
		out := append(append([]string{}, chars[:start]...), chars[end:]...)
		if cursor > end {
			return out, cursor - (end - start)
		}
		return out, min(cursor, start)
	})
}

func (m *Model) wordStart() int {
	chars, i := m.modal.chars, m.modal.cursor
	for i > 0 && chars[i-1] == " " {
		i--
	}
	for i > 0 && chars[i-1] != " " {
		i--
	}
	return i
}

type target struct {
	title, path string
	exists      bool
}

func (m *Model) target() target {
	t := target{title: strings.TrimSpace(strings.Join(m.modal.chars, ""))}
	if slug := scaffold.Slugify(t.title); slug != "" {
		t.path = filepath.ToSlash(filepath.Join(m.modal.kind.Folder, slug+".md"))
		_, err := os.Stat(filepath.Join(m.root, t.path))
		t.exists = err == nil
	}
	return t
}

func (m *Model) submit() tea.Cmd {
	md := m.modal
	if md == nil {
		return nil
	}
	t := m.target()
	switch {
	case t.title == "":
		md.err = "Type a title first"
	case t.path == "":
		md.err = "The title needs at least one letter or digit"
	case t.exists:
		md.err = t.path + " already exists"
	}
	if md.err != "" {
		return nil
	}
	path, err := md.kind.Create(m.root, t.title, m.clock())
	if err != nil {
		md.err = err.Error()
		return nil
	}
	m.closeModal()
	return tea.Batch(m.notify(fmt.Sprintf("Created new %s at %s", md.kind.Name, path), true), m.reload())
}

func (m *Model) scrollList(key string, delta int) {
	if m.stats == nil {
		return
	}
	total := len(m.stats.Posts)
	if key == "drafts" {
		total = len(m.stats.Drafts)
	}
	m.scroll[key] = clamp(m.scroll[key]+delta, 0, max(0, total-m.listRows[key]))
}

func (m *Model) moveFocus(step int) {
	ids := m.regions.focusables()
	if len(ids) == 0 {
		return
	}
	i := -1
	for j, id := range ids {
		if id == m.focus {
			i = j
		}
	}
	switch {
	case i == -1 && step > 0:
		m.focus = ids[0]
	case i == -1:
		m.focus = ids[len(ids)-1]
	default:
		m.focus = ids[(i+step+len(ids))%len(ids)]
	}
}

// activate clicks the focused element.
func (m *Model) activate() tea.Cmd {
	if r := m.regions.byID(m.focus); r != nil && r.OnClick != nil {
		return r.OnClick()
	}
	return nil
}

// --- input ---------------------------------------------------------------------

var pasteSpace = regexp.MustCompile(`[\r\n\t]+`)

// Update handles a message.
func (m *Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	cmd := m.update(msg)
	return m, tea.Batch(cmd, m.ensureSpinner())
}

func (m *Model) update(msg tea.Msg) tea.Cmd {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width, m.height = msg.Width, msg.Height
	case clockMsg:
		return tickClock()
	case spinMsg:
		m.frame++
		m.spinning = false
	case toastDoneMsg:
		if m.toast != nil && m.toast.id == int(msg) {
			m.toast = nil
		}
	case fileChangedMsg:
		return tea.Batch(m.reload(), m.waitForChange())
	case statsMsg:
		m.loading = false
		if msg.err != nil {
			m.loadErr = msg.err.Error()
		} else {
			m.stats, m.loadErr, m.updatedAt = msg.stats, "", m.clock()
		}
		if m.reloadAgain {
			m.reloadAgain = false
			return m.reload()
		}
	case weatherMsg:
		if m.now != nil && msg.token == m.nowToken {
			m.now.weather, m.now.weatherStatus = msg.weather, okOrError(msg.err)
		}
	case reposMsg:
		if m.now != nil && msg.token == m.nowToken {
			m.now.repos, m.now.reposStatus = msg.repos, okOrError(msg.err)
		}
	case tea.PasteMsg:
		if m.modal != nil {
			m.focus = "modal:input"
			m.insert(pasteSpace.ReplaceAllString(msg.Content, " "))
		}
	case tea.MouseMsg:
		return m.handleMouse(msg)
	case tea.KeyPressMsg:
		switch msg.String() {
		case "ctrl+c", "ctrl+q":
			return tea.Quit
		}
		switch {
		case m.modal != nil:
			return m.handleModalKey(msg)
		case m.now != nil:
			m.handleNowKey(msg)
		default:
			return m.handleKey(msg)
		}
	}
	return nil
}

func okOrError(err error) status {
	if err != nil {
		return errorStatus
	}
	return okStatus
}

// isSpinning: something is in flight, so the spinner frames tick.
func (m *Model) isSpinning() bool {
	return m.loading || (m.now != nil && (m.now.weatherStatus == loadingStatus || m.now.reposStatus == loadingStatus))
}

func (m *Model) ensureSpinner() tea.Cmd {
	if m.spinning || !m.isSpinning() {
		return nil
	}
	m.spinning = true
	return tea.Tick(80*time.Millisecond, func(time.Time) tea.Msg { return spinMsg{} })
}

func (m *Model) handleMouse(msg tea.MouseMsg) tea.Cmd {
	mouse := msg.Mouse()
	x, y := mouse.X, mouse.Y
	m.mouseX, m.mouseY = x, y

	switch msg.(type) {
	case tea.MouseMotionMsg:
		m.hover = m.idAt(x, y)
	case tea.MouseWheelMsg:
		delta := 1
		if mouse.Button == tea.MouseWheelUp {
			delta = -1
		}
		if r := m.regions.at(x, y, func(r Region) bool { return r.OnWheel != nil }); r != nil {
			r.OnWheel(delta)
		}
	case tea.MouseClickMsg:
		if mouse.Button != tea.MouseLeft {
			return nil
		}
		r := m.regions.at(x, y, nil)
		m.pressed = ""
		if r != nil {
			m.pressed = r.ID
			if r.Focusable {
				m.focus = r.ID
			}
			if r.OnPress != nil {
				r.OnPress(x, y)
			}
		}
	case tea.MouseReleaseMsg:
		r := m.regions.at(x, y, nil)
		wasPressed := m.pressed
		m.pressed = ""
		if r != nil && r.ID == wasPressed && r.OnClick != nil {
			return r.OnClick()
		}
	}
	return nil
}

func (m *Model) idAt(x, y int) string {
	if r := m.regions.at(x, y, nil); r != nil {
		return r.ID
	}
	return ""
}

// text is the printable text of a key press, if any.
func text(msg tea.KeyPressMsg) string {
	if msg.Mod&(tea.ModCtrl|tea.ModAlt) != 0 {
		return ""
	}
	return msg.Text
}

func (m *Model) handleModalKey(msg tea.KeyPressMsg) tea.Cmd {
	md := m.modal
	if t := text(msg); t != "" {
		m.focus = "modal:input"
		m.insert(t)
		return nil
	}
	switch msg.String() {
	case "ctrl+a", "home":
		m.edit(func(chars []string, _ int) ([]string, int) { return chars, 0 })
	case "ctrl+e", "end":
		m.edit(func(chars []string, _ int) ([]string, int) { return chars, len(chars) })
	case "ctrl+u":
		m.deleteRange(0, md.cursor)
	case "ctrl+k":
		m.deleteRange(md.cursor, len(md.chars))
	case "ctrl+w":
		m.deleteRange(m.wordStart(), md.cursor)
	case "esc":
		m.closeModal()
	case "enter":
		if m.focus == "modal:cancel" {
			m.closeModal()
			return nil
		}
		return m.submit()
	case "tab":
		m.moveFocus(1)
	case "shift+tab":
		m.moveFocus(-1)
	case "backspace":
		m.deleteRange(md.cursor-1, md.cursor)
	case "delete":
		m.deleteRange(md.cursor, md.cursor+1)
	case "left":
		m.edit(func(chars []string, cursor int) ([]string, int) { return chars, cursor - 1 })
	case "right":
		m.edit(func(chars []string, cursor int) ([]string, int) { return chars, cursor + 1 })
	}
	return nil
}

func (m *Model) handleNowKey(msg tea.KeyPressMsg) {
	switch msg.String() {
	case "q", "n", "space", "esc", "enter":
		m.closeNow()
	case "up":
		m.scrollNow(-1)
	case "down":
		m.scrollNow(1)
	case "pgup":
		m.scrollNow(-m.nowRows)
	case "pgdown":
		m.scrollNow(m.nowRows)
	}
}

func (m *Model) handleKey(msg tea.KeyPressMsg) tea.Cmd {
	switch key := msg.String(); key {
	case "n":
		return m.openNow()
	case "space", "enter":
		return m.activate()
	case "r":
		return m.reload()
	case "q":
		return tea.Quit
	case "tab", "right":
		m.moveFocus(1)
	case "shift+tab", "left":
		m.moveFocus(-1)
	case "up":
		m.scrollList("recent", -1)
	case "down":
		m.scrollList("recent", 1)
	case "pgup":
		m.scrollList("recent", -m.listRows["recent"])
	case "pgdown":
		m.scrollList("recent", m.listRows["recent"])
	default:
		for _, k := range kinds {
			if key == k.key || key == k.id[:1] {
				m.openModal(k)
			}
		}
	}
	return nil
}

// View paints the frame.
func (m *Model) View() tea.View {
	c := m.render()
	// Layout may have moved under a still pointer (modal closed, list
	// scrolled): refresh the hover so highlights stay truthful.
	if m.mouseX >= 0 {
		if id := m.idAt(m.mouseX, m.mouseY); id != m.hover {
			m.hover = id
			c = m.render()
		}
	}
	v := tea.NewView(c.String())
	v.AltScreen = true
	v.MouseMode = tea.MouseModeAllMotion
	v.WindowTitle = "salvatorelaisa.blog dashboard"
	return v
}
