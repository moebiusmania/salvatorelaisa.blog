package dashboard

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"salvatorelaisa.blog/internal/content"
)

// PostInfo is one post as the dashboard shows it.
type PostInfo struct {
	Slug, Title string
	Date        *time.Time // nil when missing or unparsable
	Tags        []string
	Draft       bool
	Pinned      bool
	Words       int
	// ReadingTime in minutes, computed like the site does.
	ReadingTime int
}

type yearCount struct{ Year, Count int }
type tagCount struct {
	Tag   string
	Count int
}
type visibility struct{ Visible, Hidden int }

// Stats are the numbers on the dashboard, read straight from the content.
type Stats struct {
	Posts, Drafts      []PostInfo // newest first
	Words, ReadingTime int
	PerYear            []yearCount
	Tags               []tagCount
	Devices, Books     visibility
	Theme              string
	DaysSinceLastPost  *int
}

var looseDate = regexp.MustCompile(`^(\d{4})-(\d{1,2})-(\d{1,2})`)

// toDate accepts YAML dates as well as loose strings like `2020-04-3`.
func toDate(v any) *time.Time {
	if t, ok := v.(time.Time); ok {
		t = t.UTC()
		return &t
	}
	s, ok := v.(string)
	if !ok {
		return nil
	}
	m := looseDate.FindStringSubmatch(s)
	if m == nil {
		return nil
	}
	y, _ := strconv.Atoi(m[1])
	mo, _ := strconv.Atoi(m[2])
	d, _ := strconv.Atoi(m[3])
	t := time.Date(y, time.Month(mo), d, 0, 0, 0, 0, time.UTC)
	return &t
}

func byDateDesc(posts []PostInfo) {
	sort.SliceStable(posts, func(i, j int) bool {
		a, b := posts[i], posts[j]
		var ta, tb int64
		if a.Date != nil {
			ta = a.Date.Unix()
		}
		if b.Date != nil {
			tb = b.Date.Unix()
		}
		if ta != tb {
			return ta > tb
		}
		return a.Title < b.Title
	})
}

func markdownFiles(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if os.IsNotExist(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var files []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".md") {
			files = append(files, e.Name())
		}
	}
	return files, nil
}

// countCollection applies the site's rule: a "-" prefix or `draft: true` hides.
func countCollection(dir string) (visibility, error) {
	var v visibility
	files, err := markdownFiles(dir)
	if err != nil {
		return v, err
	}
	for _, f := range files {
		raw, err := os.ReadFile(filepath.Join(dir, f))
		if err != nil {
			return v, err
		}
		data, _, _ := content.Parse(string(raw))
		if strings.HasPrefix(f, "-") || data["draft"] == true {
			v.Hidden++
		} else {
			v.Visible++
		}
	}
	return v, nil
}

var themeLine = regexp.MustCompile(`(?m)^currentTheme = "([^"]+)"`)

func readTheme(root string) string {
	raw, err := os.ReadFile(filepath.Join(root, "hugo.toml"))
	if err != nil {
		return "?"
	}
	if m := themeLine.FindSubmatch(raw); m != nil {
		return string(m[1])
	}
	return "?"
}

// LoadStats reads content/ and hugo.toml under root.
func LoadStats(root string, now time.Time) (*Stats, error) {
	dir := filepath.Join(root, "content")
	files, err := markdownFiles(dir)
	if err != nil {
		return nil, err
	}
	s := &Stats{}
	for _, f := range files {
		raw, err := os.ReadFile(filepath.Join(dir, f))
		if err != nil {
			return nil, err
		}
		data, body, err := content.Parse(string(raw))
		if err != nil {
			data = map[string]any{}
		}
		post := PostInfo{
			Slug:        strings.TrimSuffix(f, ".md"),
			Title:       f,
			Date:        toDate(data["date"]),
			Draft:       data["draft"] == true,
			Pinned:      data["pinned"] == true,
			Words:       content.Words(body),
			ReadingTime: content.ReadingTime(string(raw)),
		}
		if t, ok := data["title"]; ok && t != nil {
			post.Title = toString(t)
		}
		if tags, ok := data["tags"].([]any); ok {
			for _, t := range tags {
				post.Tags = append(post.Tags, toString(t))
			}
		}
		if post.Draft {
			s.Drafts = append(s.Drafts, post)
		} else {
			s.Posts = append(s.Posts, post)
		}
	}
	byDateDesc(s.Posts)
	byDateDesc(s.Drafts)

	years := map[int]int{}
	tags := map[string]int{}
	for _, p := range s.Posts {
		s.Words += p.Words
		s.ReadingTime += p.ReadingTime
		if p.Date != nil {
			years[p.Date.Year()]++
		}
		for _, t := range p.Tags {
			if t != "" {
				tags[t]++
			}
		}
	}
	// Fill the gaps so quiet years show up as empty bars.
	if len(years) > 0 {
		first, last := now.Year(), now.Year()
		for y := range years {
			first, last = min(first, y), max(last, y)
		}
		for y := first; y <= last; y++ {
			s.PerYear = append(s.PerYear, yearCount{y, years[y]})
		}
	}
	for t, n := range tags {
		s.Tags = append(s.Tags, tagCount{t, n})
	}
	sort.Slice(s.Tags, func(i, j int) bool {
		if s.Tags[i].Count != s.Tags[j].Count {
			return s.Tags[i].Count > s.Tags[j].Count
		}
		return s.Tags[i].Tag < s.Tags[j].Tag
	})

	for _, p := range s.Posts {
		if p.Date != nil {
			days := max(0, int(now.Sub(*p.Date).Hours()/24))
			s.DaysSinceLastPost = &days
			break
		}
	}

	if s.Devices, err = countCollection(filepath.Join(dir, "devices")); err != nil {
		return nil, err
	}
	if s.Books, err = countCollection(filepath.Join(dir, "books")); err != nil {
		return nil, err
	}
	s.Theme = readTheme(root)
	return s, nil
}

func toString(v any) string {
	switch v := v.(type) {
	case string:
		return v
	case time.Time:
		return v.Format("2006-01-02")
	default:
		return fmt.Sprint(v)
	}
}
