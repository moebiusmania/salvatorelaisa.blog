package stats

import (
	"os"
	"path/filepath"
	"testing"
)

func TestCount(t *testing.T) {
	root := t.TempDir()
	dir := filepath.Join(root, "content")
	os.MkdirAll(filepath.Join(dir, "devices"), 0o755)
	for name, body := range map[string]string{
		"a.md": "draft: true", "b.md": "draft: false", "_template.md": "draft: true", "notes.txt": "",
		"devices/x.md": "", "devices/-y.md": "",
	} {
		os.WriteFile(filepath.Join(dir, name), []byte(body), 0o644)
	}
	q, err := Count(root)
	if err != nil {
		t.Fatal(err)
	}
	if q != (Quick{Posts: 2, Drafts: 1, Devices: 2, DeviceDrafts: 1}) {
		t.Errorf("got %+v", q)
	}
}
