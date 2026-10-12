// Command parity compares two builds of the site (the Lume baseline and the
// Hugo build) and reports every user-visible difference. Throwaway migration
// tooling: HTML is compared as a normalized DOM (insignificant whitespace,
// comments and attribute order ignored), everything else byte for byte.
//
//	go run ./internal/parity _site_baseline _site [path-filter]
package main

import (
	"bytes"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
)

// Known, accepted differences.
var (
	skipFiles = map[string]bool{
		"assets/js/main.js": true, // different bundler, checked by hand
	}
	volatile = []*regexp.Regexp{
		regexp.MustCompile(`<lastBuildDate>[^<]*</lastBuildDate>`),
		// Seasonal decorations are randomized on every build.
		regexp.MustCompile(`style="--top:[^"]*"`),
		regexp.MustCompile(`<span class="spook-inner">[^<]*</span>`),
		// Footer credit: "sviluppato con Lume" became "… Hugo".
		regexp.MustCompile(`<a href="https://(lume\.land|gohugo\.io)/"[^>]*>(Lume|Hugo)</a>`),
	}
)

// Removed before comparing: lint pragma dropped from the inlined script.
var strip = regexp.MustCompile(`// deno-lint-ignore-file[^\n]*\n`)

func main() {
	if len(os.Args) < 3 {
		fmt.Fprintln(os.Stderr, "usage: parity <baseline> <build> [path-filter]")
		os.Exit(2)
	}
	oldDir, newDir := os.Args[1], os.Args[2]
	filter := ""
	if len(os.Args) > 3 {
		filter = os.Args[3]
	}

	oldFiles, newFiles := list(oldDir), list(newDir)
	var paths []string
	for p := range union(oldFiles, newFiles) {
		if strings.Contains(p, filter) && !skipFiles[p] {
			paths = append(paths, p)
		}
	}
	sort.Strings(paths)

	diffs := 0
	for _, p := range paths {
		switch {
		case !oldFiles[p]:
			fmt.Printf("+ %s (only in new build)\n", p)
			diffs++
		case !newFiles[p]:
			fmt.Printf("- %s (missing from new build)\n", p)
			diffs++
		default:
			if msg := compare(filepath.Join(oldDir, p), filepath.Join(newDir, p)); msg != "" {
				fmt.Printf("≠ %s\n%s\n", p, msg)
				diffs++
			}
		}
	}
	fmt.Printf("\n%d files compared, %d with differences\n", len(paths), diffs)
	if diffs > 0 {
		os.Exit(1)
	}
}

func list(root string) map[string]bool {
	files := map[string]bool{}
	filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err == nil && !d.IsDir() {
			rel, _ := filepath.Rel(root, path)
			files[filepath.ToSlash(rel)] = true
		}
		return nil
	})
	return files
}

func union(a, b map[string]bool) map[string]bool {
	out := map[string]bool{}
	for k := range a {
		out[k] = true
	}
	for k := range b {
		out[k] = true
	}
	return out
}

func compare(oldPath, newPath string) string {
	a, _ := os.ReadFile(oldPath)
	b, _ := os.ReadFile(newPath)
	a, b = strip.ReplaceAll(a, nil), strip.ReplaceAll(b, nil)
	for _, re := range volatile {
		a = re.ReplaceAll(a, []byte("«volatile»"))
		b = re.ReplaceAll(b, []byte("«volatile»"))
	}
	if strings.HasSuffix(oldPath, ".html") {
		a, b = []byte(normalize(a)), []byte(normalize(b))
	}
	if bytes.Equal(a, b) {
		return ""
	}
	// PARITY_DUMP=<dir> writes both normalized versions, for a full diff.
	if dir := os.Getenv("PARITY_DUMP"); dir != "" {
		name := strings.ReplaceAll(strings.TrimPrefix(newPath, os.Args[2]), "/", "_")
		os.WriteFile(filepath.Join(dir, name+".old"), a, 0o644)
		os.WriteFile(filepath.Join(dir, name+".new"), b, 0o644)
	}
	return firstDiff(string(a), string(b))
}

// firstDiff shows the first differing line with a little context.
func firstDiff(a, b string) string {
	la, lb := strings.Split(a, "\n"), strings.Split(b, "\n")
	i := 0
	for i < len(la) && i < len(lb) && la[i] == lb[i] {
		i++
	}
	var out strings.Builder
	for j := max(0, i-2); j < i; j++ {
		fmt.Fprintf(&out, "    %s\n", clip(la[j]))
	}
	for j := i; j < min(len(la), i+3); j++ {
		fmt.Fprintf(&out, "  - %s\n", clip(la[j]))
	}
	for j := i; j < min(len(lb), i+3); j++ {
		fmt.Fprintf(&out, "  + %s\n", clip(lb[j]))
	}
	return strings.TrimRight(out.String(), "\n")
}

func clip(s string) string {
	if len(s) > 220 {
		return s[:220] + "…"
	}
	return s
}

var block = map[atom.Atom]bool{}

func init() {
	for _, a := range []atom.Atom{atom.Html, atom.Head, atom.Body, atom.Div, atom.Section, atom.Article,
		atom.Header, atom.Footer, atom.Main, atom.Nav, atom.Ul, atom.Ol, atom.Li, atom.P, atom.H1, atom.H2,
		atom.H3, atom.H4, atom.H5, atom.H6, atom.Hgroup, atom.Form, atom.Figure, atom.Hr, atom.Dialog,
		atom.Template, atom.Meta, atom.Link, atom.Script, atom.Style, atom.Title, atom.Table, atom.Tr,
		atom.Td, atom.Th, atom.Thead, atom.Tbody, atom.Blockquote, atom.Pre, atom.Iframe, atom.Svg, atom.Br} {
		block[a] = true
	}
}

var spaces = regexp.MustCompile(`[ \t\n\r\f]+`)

// normalize renders the document one node per line, with whitespace that a
// browser would not show removed.
func normalize(src []byte) string {
	doc, err := html.Parse(bytes.NewReader(src))
	if err != nil {
		return string(src)
	}
	dropComments(doc)
	var out strings.Builder
	walk(&out, doc, 0, false)
	return out.String()
}

// dropComments removes comment nodes and merges the text nodes they separated.
func dropComments(n *html.Node) {
	for c := n.FirstChild; c != nil; {
		next := c.NextSibling
		switch {
		case c.Type == html.CommentNode:
			n.RemoveChild(c)
		case c.Type == html.TextNode && c.PrevSibling != nil && c.PrevSibling.Type == html.TextNode:
			c.PrevSibling.Data += c.Data
			n.RemoveChild(c)
		default:
			dropComments(c)
		}
		c = next
	}
}

func isBlock(n *html.Node) bool {
	return n == nil || (n.Type == html.ElementNode && (block[n.DataAtom] || n.Namespace == "svg"))
}

func prevSignificant(n *html.Node) *html.Node {
	for s := n.PrevSibling; s != nil; s = s.PrevSibling {
		if s.Type != html.CommentNode {
			return s
		}
	}
	return nil
}

func nextSignificant(n *html.Node) *html.Node {
	for s := n.NextSibling; s != nil; s = s.NextSibling {
		if s.Type != html.CommentNode {
			return s
		}
	}
	return nil
}

func walk(out *strings.Builder, n *html.Node, depth int, pre bool) {
	indent := strings.Repeat("  ", depth)
	switch n.Type {
	case html.CommentNode, html.DoctypeNode:
		return
	case html.TextNode:
		text := n.Data
		if !pre {
			text = spaces.ReplaceAllString(text, " ")
			if isBlock(prevSignificant(n)) || (n.PrevSibling == nil && isBlock(n.Parent)) {
				text = strings.TrimLeft(text, " ")
			}
			if isBlock(nextSignificant(n)) || (n.NextSibling == nil && isBlock(n.Parent)) {
				text = strings.TrimRight(text, " ")
			}
		}
		if pre && n.Parent != nil && (n.Parent.DataAtom == atom.Script || n.Parent.DataAtom == atom.Style) {
			text = strings.TrimSpace(text)
		}
		if text != "" {
			fmt.Fprintf(out, "%s%q\n", indent, text)
		}
		return
	case html.ElementNode:
		attrs := make([]string, 0, len(n.Attr))
		for _, a := range n.Attr {
			key := a.Key
			if a.Namespace != "" {
				key = a.Namespace + ":" + key
			}
			attrs = append(attrs, fmt.Sprintf("%s=%q", key, a.Val))
		}
		sort.Strings(attrs)
		fmt.Fprintf(out, "%s<%s %s>\n", indent, n.Data, strings.Join(attrs, " "))
		pre = pre || n.DataAtom == atom.Pre || n.DataAtom == atom.Script || n.DataAtom == atom.Style || n.DataAtom == atom.Textarea
		depth++
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		walk(out, c, depth, pre)
	}
}
