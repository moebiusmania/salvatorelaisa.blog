package todo

import (
	"os"
	"path/filepath"
	"testing"
)

func TestRoundTrip(t *testing.T) {
	dir := t.TempDir()
	l := List{Path: filepath.Join(dir, "todo.md"), Template: filepath.Join(dir, "todo.template.md")}

	if got := l.Init(); got != "🚨 Template not found." {
		t.Errorf("Init without template = %q", got)
	}
	os.WriteFile(l.Template, []byte("- [x] publish blog\n- [ ] write posts\n"), 0o644)
	if got := l.Init(); got != "✔︎ Todo initialized." {
		t.Errorf("Init = %q", got)
	}
	if msg, _ := l.Add("fix bugs"); msg != "Aggiunto: fix bugs" {
		t.Errorf("Add = %q", msg)
	}
	if msg, _ := l.Done(2); msg != "Completato: write posts" {
		t.Errorf("Done = %q", msg)
	}
	if msg, _ := l.Remove(1); msg != "Rimosso: publish blog" {
		t.Errorf("Remove = %q", msg)
	}
	if msg, _ := l.Remove(9); msg != "Indice non valido." {
		t.Errorf("Remove(9) = %q", msg)
	}
	want := "1. [x] write posts\n2. [ ] fix bugs\n\nTotali: 2, Da completare: 1"
	if got := l.Show(); got != want {
		t.Errorf("Show =\n%s\nwant\n%s", got, want)
	}
	raw, _ := os.ReadFile(l.Path)
	if string(raw) != "- [x] write posts\n- [ ] fix bugs" {
		t.Errorf("file = %q", raw)
	}
	os.Remove(l.Path)
	if got := l.Show(); got != "Nessun task." {
		t.Errorf("Show on missing file = %q", got)
	}
}
