package content

import (
	"errors"
	"fmt"
	"sort"
	"strings"
	"time"

	"go.yaml.in/yaml/v3"
)

// Front matter schemas, ported from the old zod schemas. Validation runs before
// every build, so a typo in a post's front matter fails the build instead of
// silently rendering a broken page.

// StringList accepts either a list of strings or a single string.
type StringList []string

func (l *StringList) UnmarshalYAML(node *yaml.Node) error {
	if node.Kind == yaml.ScalarNode {
		var s string
		if err := node.Decode(&s); err != nil {
			return err
		}
		*l = StringList{s}
		return nil
	}
	var list []string
	if err := node.Decode(&list); err != nil {
		return err
	}
	*l = list
	return nil
}

type Platform struct {
	Label string `yaml:"label" json:"label"`
	URL   string `yaml:"url" json:"url"`
}

type Post struct {
	// Any scalar decodes into a string, so `title: 1999` is fine.
	Title     *string    `yaml:"title"`
	Date      *string    `yaml:"date"`
	Tags      []string   `yaml:"tags"`
	Draft     *bool      `yaml:"draft"`
	Pinned    bool       `yaml:"pinned"`
	Summary   *string    `yaml:"summary"`
	Images    StringList `yaml:"images"`
	Platforms []Platform `yaml:"platforms"`
}

// PostDate parses the dates accepted for posts: a day, or a full timestamp.
func PostDate(value string) (time.Time, error) {
	for _, layout := range []string{"2006-01-02", time.RFC3339, "2006-01-02T15:04:05", "2006-01-02 15:04:05"} {
		if t, err := time.Parse(layout, value); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("date: invalid date %q", value)
}

func (p *Post) validate() error {
	var errs []error
	if p.Title == nil {
		errs = append(errs, errors.New("title: required"))
	}
	if p.Date == nil {
		errs = append(errs, errors.New("date: required"))
	} else if _, err := PostDate(*p.Date); err != nil {
		errs = append(errs, err)
	}
	if p.Tags == nil {
		errs = append(errs, errors.New("tags: required"))
	}
	if p.Draft == nil {
		errs = append(errs, errors.New("draft: required"))
	}
	return errors.Join(errs...)
}

func (p *Post) isDraft() bool { return p.IsDraft() }

// IsDraft reports whether the post has `draft: true`.
func (p *Post) IsDraft() bool { return p.Draft != nil && *p.Draft }

type SectionItem struct {
	Title       string `yaml:"title" json:"title"`
	Badge       string `yaml:"badge" json:"badge,omitempty"`
	URL         string `yaml:"url" json:"url,omitempty"`
	Description string `yaml:"description" json:"description,omitempty"`
	Featured    bool   `yaml:"featured" json:"featured,omitempty"`
}

type Section struct {
	Heading string        `yaml:"heading" json:"heading"`
	Icon    string        `yaml:"icon" json:"icon,omitempty"`
	Items   []SectionItem `yaml:"items" json:"items"`
}

type Page struct {
	Title    *string   `yaml:"title"`
	Sections []Section `yaml:"sections"`
}

func (p *Page) validate() error {
	if p.Title == nil {
		return errors.New("title: required")
	}
	for i, s := range p.Sections {
		if s.Heading == "" {
			return fmt.Errorf("sections[%d].heading: required", i)
		}
		for j, item := range s.Items {
			if item.Title == "" {
				return fmt.Errorf("sections[%d].items[%d].title: required", i, j)
			}
		}
	}
	return nil
}

func (p *Page) isDraft() bool { return false }

type Device struct {
	Title    *string  `yaml:"title"`
	Purchase *string  `yaml:"purchase"`
	Tags     []string `yaml:"tags"`
	Image    *string  `yaml:"image"`
	URL      string   `yaml:"url"`
	Post     string   `yaml:"post"`
	Draft    bool     `yaml:"draft"`
}

func (d *Device) validate() error {
	return required(map[string]bool{
		"title": d.Title == nil, "purchase": d.Purchase == nil, "tags": d.Tags == nil, "image": d.Image == nil,
	})
}

func (d *Device) isDraft() bool { return d.Draft }

type Book struct {
	Title    *string `yaml:"title"`
	Author   *string `yaml:"author"`
	Language *string `yaml:"language"`
	// A string rather than a date so partial values like "2023-06" are allowed.
	Read string `yaml:"read"`
	URL  string `yaml:"url"`
	// Overrides for the spine look, otherwise derived from a hash of the path.
	Color  string `yaml:"color"`
	Height string `yaml:"height"`
	Draft  bool   `yaml:"draft"`
}

func (b *Book) validate() error {
	return required(map[string]bool{
		"title": b.Title == nil, "author": b.Author == nil, "language": b.Language == nil,
	})
}

func (b *Book) isDraft() bool { return b.Draft }

func required(missing map[string]bool) error {
	var names []string
	for name, isMissing := range missing {
		if isMissing {
			names = append(names, name+": required")
		}
	}
	if len(names) == 0 {
		return nil
	}
	sort.Strings(names)
	return errors.New(strings.Join(names, "\n"))
}
