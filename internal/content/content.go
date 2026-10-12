// Package content reads the Markdown files under content/: front matter
// parsing, schema validation and the data-only collections (devices, books,
// standalone pages) that are rendered inside other pages instead of becoming
// pages of their own.
package content

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"go.yaml.in/yaml/v3"
)

var frontMatterRE = regexp.MustCompile(`^---\r?\n((?s:.*?))\r?\n---\r?\n?`)

// Split returns the raw YAML front matter and the body that follows it. A file
// without front matter is all body.
func Split(source string) (frontMatter, body string, ok bool) {
	m := frontMatterRE.FindStringSubmatchIndex(source)
	if m == nil {
		return "", source, false
	}
	return source[m[2]:m[3]], source[m[1]:], true
}

// Parse decodes the front matter of source into a generic map, plus the body.
func Parse(source string) (map[string]any, string, error) {
	fm, body, ok := Split(source)
	data := map[string]any{}
	if !ok {
		return data, body, nil
	}
	if err := yaml.Unmarshal([]byte(fm), &data); err != nil {
		return nil, "", err
	}
	if data == nil {
		data = map[string]any{}
	}
	return data, body, nil
}

// Decode decodes the front matter of source into v (one of the schema structs)
// and validates it, returning the body.
func Decode(source, file string, v interface{ validate() error }) (string, error) {
	fm, body, _ := Split(source)
	if err := yaml.Unmarshal([]byte(fm), v); err != nil {
		return "", fmt.Errorf("invalid front matter in %s:\n%w", file, err)
	}
	if err := v.validate(); err != nil {
		return "", fmt.Errorf("invalid front matter in %s:\n%w", file, err)
	}
	return body, nil
}

// Entry is one file of a data-only collection.
type Entry[T any] struct {
	Data T
	// Path is the Nuxt Content style path, e.g. "/books/dune" (seeds the book spines).
	Path string
	// Slug is the filename without extension.
	Slug string
	// Body is the raw Markdown after the front matter.
	Body string
}

type drafter interface {
	validate() error
	isDraft() bool
}

// LoadCollection reads every .md file in dir (non recursive), validated against
// T. Files whose name starts with "-" and entries with `draft: true` are
// skipped, matching the old Nuxt queries. Entries are sorted by slug.
func LoadCollection[T any, PT interface {
	*T
	drafter
}](dir string) ([]Entry[T], error) {
	files, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	folder := filepath.Base(dir)
	var entries []Entry[T]
	for _, f := range files {
		name := f.Name()
		if f.IsDir() || !strings.HasSuffix(name, ".md") || strings.HasPrefix(name, "-") {
			continue
		}
		file := filepath.Join(dir, name)
		raw, err := os.ReadFile(file)
		if err != nil {
			return nil, err
		}
		var data T
		body, err := Decode(string(raw), file, PT(&data))
		if err != nil {
			return nil, err
		}
		if PT(&data).isDraft() {
			continue
		}
		slug := strings.TrimSuffix(name, ".md")
		entries = append(entries, Entry[T]{Data: data, Path: "/" + folder + "/" + slug, Slug: slug, Body: body})
	}
	sort.SliceStable(entries, func(i, j int) bool { return entries[i].Slug < entries[j].Slug })
	return entries, nil
}

// jsWhitespace is JavaScript's `\s` class, which (unlike Go's) includes the
// Unicode spaces and the BOM.
func jsWhitespace(r rune) bool {
	switch r {
	case '\t', '\n', '\v', '\f', '\r', ' ', 0xa0, 0x1680, 0x2028, 0x2029, 0x202f, 0x205f, 0x3000, 0xfeff:
		return true
	}
	return r >= 0x2000 && r <= 0x200a
}

// SplitCount returns `raw.split(/\s+/).length`: one more than the number of
// whitespace runs.
func SplitCount(raw string) int {
	n, inRun := 1, false
	for _, r := range raw {
		ws := jsWhitespace(r)
		if ws && !inRun {
			n++
		}
		inRun = ws
	}
	return n
}

// ReadingTime is the estimate the Nuxt `content:file:afterParse` hook used: 180
// words per minute over the whole raw file, front matter included, so the
// numbers never changed across the migrations.
func ReadingTime(raw string) int {
	return (SplitCount(raw) + 179) / 180
}

// Words counts the whitespace-separated tokens in text.
func Words(text string) int {
	return len(strings.FieldsFunc(text, jsWhitespace))
}

// PostFile is one post (a top-level content/*.md file).
type PostFile struct {
	Post
	Slug string
	Raw  string
	Body string
}

// LoadPosts reads and validates every post in dir, drafts included, sorted by
// slug.
func LoadPosts(dir string) ([]PostFile, error) {
	files, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var posts []PostFile
	for _, f := range files {
		name := f.Name()
		if f.IsDir() || !strings.HasSuffix(name, ".md") {
			continue
		}
		file := filepath.Join(dir, name)
		raw, err := os.ReadFile(file)
		if err != nil {
			return nil, err
		}
		var post Post
		body, err := Decode(string(raw), file, &post)
		if err != nil {
			return nil, err
		}
		posts = append(posts, PostFile{Post: post, Slug: strings.TrimSuffix(name, ".md"), Raw: string(raw), Body: body})
	}
	return posts, nil
}
