// Package drafts lists the draft posts.
package drafts

import (
	"fmt"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	"go.yaml.in/yaml/v3"

	"salvatorelaisa.blog/internal/termtable"
)

// Draft is one row of the drafts table.
type Draft struct {
	Date, Title, Tags string
	sortKey           float64
}

// The original script only understood LF front matter.
var frontMatterRE = regexp.MustCompile(`^---\n((?s:.*?))\n---`)

// List returns the posts in dir with a truthy `draft`, oldest first; undated
// posts land at the bottom, alphabetically by title.
func List(dir string) ([]Draft, error) {
	files, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var drafts []Draft
	for _, f := range files {
		if f.IsDir() || !strings.HasSuffix(f.Name(), ".md") {
			continue
		}
		raw, err := os.ReadFile(filepath.Join(dir, f.Name()))
		if err != nil {
			return nil, err
		}
		data := map[string]any{}
		if m := frontMatterRE.FindSubmatch(raw); m != nil {
			// Broken YAML counts as no front matter.
			if yaml.Unmarshal(m[1], &data) != nil {
				data = map[string]any{}
			}
		}
		if !truthy(data["draft"]) {
			continue
		}
		date := normalizeDate(data["date"])
		drafts = append(drafts, Draft{
			Title:   truncate(orDefault(data["title"], "Untitled")),
			Date:    orDefault(date, "No date"),
			Tags:    tags(data["tags"]),
			sortKey: sortKey(date),
		})
	}
	sort.SliceStable(drafts, func(i, j int) bool {
		if drafts[i].sortKey == drafts[j].sortKey {
			return drafts[i].Title < drafts[j].Title
		}
		return drafts[i].sortKey < drafts[j].sortKey
	})
	return drafts, nil
}

// Render formats the drafts the way `blog drafts` prints them.
func Render(drafts []Draft) string {
	if len(drafts) == 0 {
		return "No draft posts found.\n"
	}
	rows := make([][]string, len(drafts))
	for i, d := range drafts {
		rows[i] = []string{d.Date, d.Title, d.Tags}
	}
	return fmt.Sprintf("\n📝 Draft Posts (%d):\n\n%s\n", len(drafts),
		termtable.Render([]string{"Date", "Title", "Tags"}, rows))
}

func truthy(v any) bool {
	switch v := v.(type) {
	case nil:
		return false
	case bool:
		return v
	case string:
		return v != ""
	case int:
		return v != 0
	case float64:
		return v != 0
	}
	return true
}

func orDefault(v any, fallback string) string {
	if v == nil || v == "" {
		return fallback
	}
	return fmt.Sprint(v)
}

func truncate(title string) string {
	words := strings.Split(title, " ")
	if len(words) > 6 {
		return strings.Join(words[:6], " ") + "..."
	}
	return title
}

var looseDate = regexp.MustCompile(`^(\d{4})-(\d{1,2})-(\d{1,2})`)

// normalizeDate turns `2020-04-3` & friends into `2020-04-03` so the column
// lines up.
func normalizeDate(v any) string {
	switch v := v.(type) {
	case nil:
		return ""
	case time.Time:
		return v.UTC().Format("2006-01-02")
	}
	s := fmt.Sprint(v)
	m := looseDate.FindStringSubmatch(s)
	if m == nil {
		return s
	}
	return m[1] + "-" + pad(m[2]) + "-" + pad(m[3])
}

func pad(s string) string {
	if len(s) == 1 {
		return "0" + s
	}
	return s
}

// sortKey is a sortable YYYYMMDD number; undated posts sort last.
func sortKey(date string) float64 {
	digits := strings.ReplaceAll(date, "-", "")
	var n float64
	if len(digits) != 8 {
		return math.Inf(1)
	}
	for _, r := range digits {
		if r < '0' || r > '9' {
			return math.Inf(1)
		}
		n = n*10 + float64(r-'0')
	}
	return n
}

func tags(v any) string {
	if list, ok := v.([]any); ok {
		parts := make([]string, len(list))
		for i, t := range list {
			parts[i] = fmt.Sprint(t)
		}
		return strings.Join(parts, ", ")
	}
	return orDefault(v, "No tags")
}
