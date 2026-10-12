// Package stats computes the quick blog stats printed by `blog stats`.
package stats

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"salvatorelaisa.blog/internal/termtable"
)

// Quick holds the counts of the quick stats table.
type Quick struct {
	Posts, Drafts, Devices, DeviceDrafts int
}

// Count reads content/ under root. Drafts are counted by a plain
// "draft: true" substring, and hidden devices by their leading "-".
func Count(root string) (Quick, error) {
	var q Quick
	dir := filepath.Join(root, "content")
	files, err := os.ReadDir(dir)
	if err != nil {
		return q, err
	}
	for _, f := range files {
		if f.IsDir() || !strings.HasSuffix(f.Name(), ".md") || f.Name() == "_template.md" {
			continue
		}
		raw, err := os.ReadFile(filepath.Join(dir, f.Name()))
		if err != nil {
			return q, err
		}
		q.Posts++
		if strings.Contains(string(raw), "draft: true") {
			q.Drafts++
		}
	}
	devices, err := os.ReadDir(filepath.Join(dir, "devices"))
	if err != nil {
		return q, err
	}
	for _, f := range devices {
		if f.IsDir() {
			continue
		}
		q.Devices++
		if strings.HasPrefix(f.Name(), "-") {
			q.DeviceDrafts++
		}
	}
	return q, nil
}

// Render formats the stats the way `blog stats` prints them.
func (q Quick) Render() string {
	return "\n📊 Blog quick stats\n\n" + termtable.Render([]string{"Category", "Count"}, [][]string{
		{"📄 Posts", fmt.Sprint(q.Posts)},
		{"📝 Drafts", fmt.Sprint(q.Drafts)},
		{"📱 Device Cards", fmt.Sprint(q.Devices)},
		{"📝 Device Card Drafts", fmt.Sprint(q.DeviceDrafts)},
	})
}
