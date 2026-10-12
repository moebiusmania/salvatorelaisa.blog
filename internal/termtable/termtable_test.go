package termtable

import "testing"

func TestRender(t *testing.T) {
	got := Render([]string{"A", "Count"}, [][]string{{"xyz", "1"}, {"è", "22"}})
	want := "┌─────┬───────┐\n" +
		"│ A   │ Count │\n" +
		"├─────┼───────┤\n" +
		"│ xyz │ 1     │\n" +
		"├─────┼───────┤\n" +
		"│ è   │ 22    │\n" +
		"└─────┴───────┘\n"
	if got != want {
		t.Errorf("got\n%s\nwant\n%s", got, want)
	}
}
