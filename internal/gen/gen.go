// Package gen turns the content Hugo can't use directly into data files under
// data/gen/: validated front matter, reading times, book spines and the
// data-only collections (devices, books, standalone pages).
package gen

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"

	"salvatorelaisa.blog/internal/books"
	"salvatorelaisa.blog/internal/content"
)

// Options configures a run. Root is the repository root.
type Options struct {
	Root   string
	Drafts bool
}

type posts struct {
	// Published is how many posts the build includes (drafts too with
	// --drafts); routes/post/_content.gotmpl paginates on it.
	Published   int            `json:"published"`
	ReadingTime map[string]int `json:"readingTime"`
}

type device struct {
	Slug          string   `json:"slug"`
	Path          string   `json:"path"`
	Title         string   `json:"title"`
	Purchase      string   `json:"purchase"`
	PurchaseLabel string   `json:"purchaseLabel"`
	Tags          []string `json:"tags"`
	Image         string   `json:"image"`
	URL           string   `json:"url,omitempty"`
	Post          string   `json:"post,omitempty"`
	Body          string   `json:"body"`
}

type book struct {
	Slug      string `json:"slug"`
	Path      string `json:"path"`
	Title     string `json:"title"`
	Author    string `json:"author"`
	Language  string `json:"language"`
	Read      string `json:"read,omitempty"`
	ReadLabel string `json:"readLabel,omitempty"`
	URL       string `json:"url,omitempty"`
	Style     string `json:"style"`
	Body      string `json:"body"`
}

type page struct {
	Title    string            `json:"title"`
	Sections []content.Section `json:"sections,omitempty"`
	Body     string            `json:"body"`
}

// Run validates all content and writes data/gen/*.json. Files are only
// rewritten when their content changes, so `hugo server` doesn't rebuild for
// nothing.
func Run(opts Options) error {
	contentDir := filepath.Join(opts.Root, "content")
	out := map[string]any{}

	allPosts, err := content.LoadPosts(contentDir)
	if err != nil {
		return err
	}
	p := posts{ReadingTime: map[string]int{}}
	for _, post := range allPosts {
		if post.IsDraft() && !opts.Drafts {
			continue
		}
		p.Published++
		p.ReadingTime[post.Slug] = content.ReadingTime(post.Raw)
	}
	out["posts"] = p

	deviceEntries, err := content.LoadCollection[content.Device](filepath.Join(contentDir, "devices"))
	if err != nil {
		return err
	}
	devices := make([]device, 0, len(deviceEntries))
	for _, e := range deviceEntries {
		d := e.Data
		devices = append(devices, device{
			Slug: e.Slug, Path: e.Path, Title: *d.Title, Purchase: *d.Purchase,
			PurchaseLabel: books.FormatDate(*d.Purchase), Tags: d.Tags, Image: *d.Image,
			URL: d.URL, Post: d.Post, Body: e.Body,
		})
	}
	// Most recent purchase first (a string compare, so partial dates work).
	sort.SliceStable(devices, func(i, j int) bool { return devices[i].Purchase > devices[j].Purchase })
	out["devices"] = devices

	bookEntries, err := content.LoadCollection[content.Book](filepath.Join(contentDir, "books"))
	if err != nil {
		return err
	}
	shelf := make([]book, 0, len(bookEntries))
	for _, e := range books.Sort(bookEntries, func(e content.Entry[content.Book]) string { return e.Data.Read }) {
		b := e.Data
		item := book{
			Slug: e.Slug, Path: e.Path, Title: *b.Title, Author: *b.Author, Language: *b.Language,
			Read: b.Read, URL: b.URL, Body: e.Body,
			Style: books.SpineStyle(e.Path, *b.Title, b.Color, b.Height).CSSVars(),
		}
		if b.Read != "" {
			item.ReadLabel = books.FormatDate(b.Read)
		}
		shelf = append(shelf, item)
	}
	out["books"] = shelf

	pages := map[string]page{}
	for _, name := range []string{"about", "halloween", "xmas"} {
		file := filepath.Join(contentDir, "pages", name+".md")
		raw, err := os.ReadFile(file)
		if err != nil {
			return err
		}
		var fm content.Page
		body, err := content.Decode(string(raw), file, &fm)
		if err != nil {
			return err
		}
		pages[name] = page{Title: *fm.Title, Sections: fm.Sections, Body: body}
	}
	out["pages"] = pages

	dir := filepath.Join(opts.Root, "data", "gen")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	for name, value := range out {
		if err := writeJSON(filepath.Join(dir, name+".json"), value); err != nil {
			return err
		}
	}
	return nil
}

func writeJSON(file string, value any) error {
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	// Bodies hold raw HTML: keep it readable.
	enc.SetEscapeHTML(false)
	enc.SetIndent("", "\t")
	if err := enc.Encode(value); err != nil {
		return fmt.Errorf("%s: %w", file, err)
	}
	if old, err := os.ReadFile(file); err == nil && bytes.Equal(old, buf.Bytes()) {
		return nil
	}
	return os.WriteFile(file, buf.Bytes(), 0o644)
}
