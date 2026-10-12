// Package scaffold creates new content files (posts, devices, books) from
// their front matter templates.
package scaffold

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// Kind is a type of content that can be scaffolded.
type Kind struct {
	// Name is the singular noun used in messages ("post").
	Name string
	// Folder is where the file goes, relative to the repository root.
	Folder   string
	template string
}

var (
	Post = Kind{Name: "post", Folder: "content", template: `---
title: "{{title}}"
date: "{{date}}"
tags:
  - ""
draft: true
summary: ""
images: [""]
---

`}
	Device = Kind{Name: "device", Folder: "content/devices", template: `---
title: "{{title}}"
purchase: "{{date}}"
tags: [""]
image: ""
post: "/post/"
# url: ""
---

`}
	// Book starts as a draft: `author` is required by the schema and an empty
	// one would render a blank spine label, so the book stays hidden until
	// it's filled in.
	Book = Kind{Name: "book", Folder: "content/books", template: `---
title: "{{title}}"
author: ""
language: "it"
read: "{{date}}"
draft: true
# url: ""
# color: ""
# height: ""
---

`}
)

// Kinds lists every kind, by name.
var Kinds = map[string]Kind{"post": Post, "device": Device, "book": Book}

var (
	notAlnum = regexp.MustCompile(`[^a-zA-Z0-9 ]`)
	spaces   = regexp.MustCompile(`\s+`)
	dashes   = regexp.MustCompile(`-+`)
)

// Slugify turns a title into a file name (without extension). Accented letters
// are dropped, not transliterated, as the old scaffolder did.
func Slugify(title string) string {
	slug := notAlnum.ReplaceAllString(strings.ToLower(title), "")
	slug = spaces.ReplaceAllString(slug, "-")
	return dashes.ReplaceAllString(slug, "-")
}

// Path is where a new entry with this title would be created.
func (k Kind) Path(root, title string) string {
	return filepath.Join(root, k.Folder, Slugify(title)+".md")
}

// ErrNoTitle is returned when the title is empty.
var ErrNoTitle = errors.New("no title")

// Create writes a new entry under root and returns its path. It never
// overwrites an existing file. The date is today's, in UTC.
func (k Kind) Create(root, title string, now time.Time) (string, error) {
	if title == "" {
		return "", ErrNoTitle
	}
	// The templates wrap the title in double quotes, so escape it for YAML.
	yamlTitle := strings.ReplaceAll(strings.ReplaceAll(title, `\`, `\\`), `"`, `\"`)
	body := strings.Replace(k.template, "{{title}}", yamlTitle, 1)
	body = strings.Replace(body, "{{date}}", now.UTC().Format("2006-01-02"), 1)

	path := k.Path(root, title)
	f, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o644)
	if err != nil {
		return "", err
	}
	if _, err := f.WriteString(body); err != nil {
		f.Close()
		return "", err
	}
	if err := f.Close(); err != nil {
		return "", err
	}
	rel, _ := filepath.Rel(root, path)
	return filepath.ToSlash(rel), nil
}

// Message is the success line printed by the CLI.
func (k Kind) Message(path string) string {
	return fmt.Sprintf("✨ Created new %s at %s", k.Name, path)
}
