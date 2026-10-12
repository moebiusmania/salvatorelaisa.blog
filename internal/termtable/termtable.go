// Package termtable renders the bordered tables the CLI prints (same layout
// as the old cliffy tables: a separator under every row).
package termtable

import (
	"strings"

	"github.com/mattn/go-runewidth"
)

// Render draws header and rows with box-drawing borders and one space of
// padding inside each cell.
func Render(header []string, rows [][]string) string {
	widths := make([]int, len(header))
	for _, row := range append([][]string{header}, rows...) {
		for i, cell := range row {
			widths[i] = max(widths[i], runewidth.StringWidth(cell))
		}
	}

	line := func(left, mid, right string) string {
		parts := make([]string, len(widths))
		for i, w := range widths {
			parts[i] = strings.Repeat("─", w+2)
		}
		return left + strings.Join(parts, mid) + right + "\n"
	}
	row := func(cells []string) string {
		var b strings.Builder
		for i, w := range widths {
			b.WriteString("│ ")
			b.WriteString(runewidth.FillRight(cells[i], w))
			b.WriteString(" ")
		}
		return b.String() + "│\n"
	}

	var b strings.Builder
	b.WriteString(line("┌", "┬", "┐"))
	b.WriteString(row(header))
	for _, r := range rows {
		b.WriteString(line("├", "┼", "┤"))
		b.WriteString(row(r))
	}
	b.WriteString(line("└", "┴", "┘"))
	return b.String()
}
