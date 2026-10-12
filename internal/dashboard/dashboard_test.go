package dashboard

import (
	"flag"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	tea "charm.land/bubbletea/v2"

	"salvatorelaisa.blog/internal/now"
)

var update = flag.Bool("update", false, "rewrite the golden snapshots")

var testNow = time.Date(2026, 10, 12, 18, 30, 0, 0, time.UTC)

// fixture writes a tiny blog repository.
func fixture(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	files := map[string]string{
		"hugo.toml":                "[params]\ncurrentTheme = \"halloween\"\n",
		"content/hello.md":         "---\ntitle: Hello world\ndate: \"2026-10-01\"\ntags: [blog, go]\ndraft: false\npinned: true\n---\n\nUno due tre quattro.\n",
		"content/older.md":         "---\ntitle: An older post with a rather long title that will not fit\ndate: \"2024-02-17\"\ntags: [go]\ndraft: false\n---\n\nCinque sei.\n",
		"content/ancient.md":       "---\ntitle: 1999\ndate: \"2011-05-03\"\ntags: [retro]\ndraft: false\n---\n\nSette.\n",
		"content/wip.md":           "---\ntitle: Work in progress\ndate: \"2026-09-30\"\ntags: [\"\"]\ndraft: true\n---\n\nOtto nove dieci.\n",
		"content/devices/phone.md": "---\ntitle: Phone\npurchase: \"2020\"\ntags: []\nimage: \"\"\n---\n",
		"content/devices/-old.md":  "---\ntitle: Old\npurchase: \"2010\"\ntags: []\nimage: \"\"\n---\n",
		"content/books/dune.md":    "---\ntitle: Dune\nauthor: Frank Herbert\nlanguage: en\n---\n",
		"content/books/draft.md":   "---\ntitle: Draft\nauthor: x\nlanguage: it\ndraft: true\n---\n",
	}
	for name, body := range files {
		path := filepath.Join(root, name)
		os.MkdirAll(filepath.Dir(path), 0o755)
		os.WriteFile(path, []byte(body), 0o644)
	}
	for _, name := range []string{"now.yaml", "weather.yaml"} {
		raw, err := os.ReadFile(filepath.Join("../../data", name))
		if err != nil {
			t.Fatal(err)
		}
		os.MkdirAll(filepath.Join(root, "data"), 0o755)
		os.WriteFile(filepath.Join(root, "data", name), raw, 0o644)
	}
	return root
}

// fakeAPIs serves the weather and GitHub endpoints.
func fakeAPIs(t *testing.T) now.Client {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/geo":
			io.WriteString(w, `{"results":[{"name":"Milano","latitude":45.46,"longitude":9.19}]}`)
		case r.URL.Path == "/forecast":
			io.WriteString(w, `{"current":{"temperature_2m":16.4,"weather_code":2}}`)
		case strings.HasSuffix(r.URL.Path, "/repos"):
			io.WriteString(w, `[{"name":"salvatorelaisa.blog","html_url":"https://github.com/x/y","description":"My blog","language":"Go"}]`)
		}
	}))
	t.Cleanup(server.Close)
	return now.Client{HTTP: server.Client(), GeocodingURL: server.URL + "/geo", ForecastURL: server.URL + "/forecast", GithubURL: server.URL}
}

func newModel(t *testing.T, w, h int) *Model {
	t.Helper()
	m := New(fixture(t))
	m.clock = func() time.Time { return testNow }
	m.client = fakeAPIs(t)
	send(t, m, tea.WindowSizeMsg{Width: w, Height: h})
	s, err := LoadStats(m.root, testNow)
	if err != nil {
		t.Fatal(err)
	}
	send(t, m, statsMsg{stats: s})
	return m
}

// send delivers msg, then runs the resulting commands (and the messages they
// produce) except timers, which would block the test.
func send(t *testing.T, m *Model, msgs ...tea.Msg) {
	t.Helper()
	for len(msgs) > 0 {
		msg := msgs[0]
		msgs = msgs[1:]
		_, cmd := m.Update(msg)
		m.View() // the input handlers rely on the last frame's regions
		msgs = append(msgs, run(cmd)...)
	}
}

func run(cmd tea.Cmd) []tea.Msg {
	if cmd == nil {
		return nil
	}
	done := make(chan tea.Msg, 1)
	go func() { done <- cmd() }()
	select {
	case msg := <-done:
		if batch, ok := msg.(tea.BatchMsg); ok {
			var out []tea.Msg
			for _, c := range batch {
				out = append(out, run(c)...)
			}
			return out
		}
		switch msg.(type) {
		case nil, spinMsg, clockMsg, toastDoneMsg:
			return nil
		}
		if _, quit := msg.(tea.QuitMsg); quit {
			return nil
		}
		return []tea.Msg{msg}
	case <-time.After(300 * time.Millisecond):
		return nil // a timer
	}
}

func key(s string) tea.KeyPressMsg {
	switch s {
	case "enter":
		return tea.KeyPressMsg{Code: tea.KeyEnter}
	case "esc":
		return tea.KeyPressMsg{Code: tea.KeyEscape}
	case "tab":
		return tea.KeyPressMsg{Code: tea.KeyTab}
	case "backspace":
		return tea.KeyPressMsg{Code: tea.KeyBackspace}
	case "ctrl+w":
		return tea.KeyPressMsg{Code: 'w', Mod: tea.ModCtrl}
	}
	return tea.KeyPressMsg{Code: []rune(s)[0], Text: s}
}

func typeText(t *testing.T, m *Model, text string) {
	for _, r := range text {
		send(t, m, key(string(r)))
	}
}

func golden(t *testing.T, name string, m *Model) {
	t.Helper()
	got := m.render().PlainText()
	file := filepath.Join("testdata", name+".golden")
	if *update {
		os.WriteFile(file, []byte(got), 0o644)
	}
	want, err := os.ReadFile(file)
	if err != nil {
		t.Fatalf("%v (run with -update to create it)", err)
	}
	if got != string(want) {
		t.Errorf("%s changed:\n%s", name, got)
	}
}

func TestMainView(t *testing.T) {
	golden(t, "main-120x40", newModel(t, 120, 40))
	golden(t, "main-80x24", newModel(t, 80, 24))
	golden(t, "too-small", newModel(t, 50, 15))
}

func TestStats(t *testing.T) {
	m := newModel(t, 120, 40)
	s := m.stats
	if len(s.Posts) != 3 || len(s.Drafts) != 1 || s.Posts[0].Slug != "hello" || !s.Posts[0].Pinned {
		t.Errorf("posts = %+v", s.Posts)
	}
	if s.Devices != (visibility{1, 1}) || s.Books != (visibility{1, 1}) || s.Theme != "halloween" {
		t.Errorf("devices %+v books %+v theme %s", s.Devices, s.Books, s.Theme)
	}
	if s.Posts[2].Title != "1999" || *s.DaysSinceLastPost != 11 {
		t.Errorf("title %q, days %d", s.Posts[2].Title, *s.DaysSinceLastPost)
	}
	if first, last := s.PerYear[0], s.PerYear[len(s.PerYear)-1]; first.Year != 2011 || last != (yearCount{2026, 1}) || len(s.PerYear) != 16 {
		t.Errorf("per year %+v … %+v", first, last)
	}
	if s.Tags[0] != (tagCount{"go", 2}) {
		t.Errorf("tags %+v", s.Tags)
	}
}

func TestNewPostModal(t *testing.T) {
	m := newModel(t, 120, 40)
	send(t, m, key("1"))
	if m.modal == nil || m.modal.kind.id != "post" {
		t.Fatal("1 doesn't open the new post modal")
	}
	typeText(t, m, "Il mio post è qui")
	send(t, m, key("ctrl+w"))
	typeText(t, m, "Hello world")
	golden(t, "modal-new-post", m)

	// "Hello world" → content/hello-world.md (hello.md exists, this doesn't).
	send(t, m, key("enter"))
	if m.modal != nil {
		t.Fatalf("modal still open: %+v", m.modal)
	}
	raw, err := os.ReadFile(filepath.Join(m.root, "content", "il-mio-post-hello-world.md"))
	if err != nil || !strings.Contains(string(raw), `title: "Il mio post è Hello world"`) {
		t.Fatalf("created file: %v\n%s", err, raw)
	}
	if m.toast == nil || m.toast.text != "Created new post at content/il-mio-post-hello-world.md" {
		t.Errorf("toast = %+v", m.toast)
	}
	if len(m.stats.Drafts) != 2 {
		t.Errorf("stats not reloaded: %d drafts", len(m.stats.Drafts))
	}
}

func TestNewModalValidation(t *testing.T) {
	m := newModel(t, 120, 40)
	send(t, m, key("p"))
	send(t, m, key("enter"))
	if m.modal.err != "Type a title first" {
		t.Errorf("empty title: %q", m.modal.err)
	}
	typeText(t, m, "è")
	send(t, m, key("enter"))
	if m.modal.err != "The title needs at least one letter or digit" {
		t.Errorf("no letters: %q", m.modal.err)
	}
	send(t, m, key("backspace"))
	typeText(t, m, "Hello")
	send(t, m, key("enter"))
	if m.modal.err != "content/hello.md already exists" {
		t.Errorf("existing file: %q", m.modal.err)
	}
	send(t, m, key("esc"))
	if m.modal != nil || m.focus != "action:post" {
		t.Errorf("esc: modal %v, focus %s", m.modal, m.focus)
	}
}

func TestNowPanel(t *testing.T) {
	m := newModel(t, 100, 40)
	send(t, m, key("n"))
	if m.now == nil || m.now.weatherStatus != okStatus || m.now.reposStatus != okStatus {
		t.Fatalf("now panel: %+v", m.now)
	}
	golden(t, "now-panel", m)
	send(t, m, key("esc"))
	if m.now != nil {
		t.Error("esc doesn't close the now panel")
	}
}

func TestMouse(t *testing.T) {
	m := newModel(t, 120, 40)
	// Find the "+ New book" button and click it.
	r := m.regions.byID("action:book")
	if r == nil {
		t.Fatal("no book button")
	}
	at := tea.Mouse{X: r.Rect.X + 1, Y: r.Rect.Y + 1, Button: tea.MouseLeft}
	send(t, m, tea.MouseMotionMsg(at))
	if m.hover != "action:book" {
		t.Errorf("hover = %q", m.hover)
	}
	send(t, m, tea.MouseClickMsg(at), tea.MouseReleaseMsg(at))
	if m.modal == nil || m.modal.kind.id != "book" {
		t.Fatal("clicking the book button doesn't open its modal")
	}
	// Clicking the dimmed backdrop closes it.
	corner := tea.Mouse{X: 0, Y: 1, Button: tea.MouseLeft}
	send(t, m, tea.MouseClickMsg(corner), tea.MouseReleaseMsg(corner))
	if m.modal != nil {
		t.Error("backdrop click doesn't close the modal")
	}
}

func TestKeyboardFocus(t *testing.T) {
	m := newModel(t, 120, 40)
	send(t, m, key("tab"))
	if m.focus != "action:device" {
		t.Errorf("focus after tab = %s", m.focus)
	}
	send(t, m, key("enter"))
	if m.modal == nil || m.modal.kind.id != "device" {
		t.Error("enter doesn't activate the focused button")
	}
}
