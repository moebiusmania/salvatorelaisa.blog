// Package todo manages the personal todo.md checklist (gitignored), seeded
// from todo.template.md.
package todo

import (
	"fmt"
	"os"
	"strings"
)

// Task is one checklist line.
type Task struct {
	Text string
	Done bool
}

// List manages the todo file at Path.
type List struct {
	Path, Template string
}

// Load reads the tasks; a missing file means no tasks. Lines that are not
// checklist items are ignored (and dropped on the next save).
func (l List) Load() []Task {
	raw, err := os.ReadFile(l.Path)
	if err != nil {
		return nil
	}
	var tasks []Task
	for _, line := range strings.Split(string(raw), "\n") {
		if strings.HasPrefix(line, "- [ ]") || strings.HasPrefix(line, "- [x]") {
			text := ""
			if len(line) > 6 {
				text = strings.TrimSpace(line[6:])
			}
			tasks = append(tasks, Task{Text: text, Done: strings.HasPrefix(line, "- [x]")})
		}
	}
	return tasks
}

func (l List) save(tasks []Task) error {
	lines := make([]string, len(tasks))
	for i, t := range tasks {
		mark := " "
		if t.Done {
			mark = "x"
		}
		lines[i] = fmt.Sprintf("- [%s] %s", mark, t.Text)
	}
	return os.WriteFile(l.Path, []byte(strings.Join(lines, "\n")), 0o644)
}

// Init copies the template over the todo file.
func (l List) Init() string {
	raw, err := os.ReadFile(l.Template)
	if err != nil {
		return "🚨 Template not found."
	}
	if err := os.WriteFile(l.Path, raw, 0o644); err != nil {
		return "🚨 " + err.Error()
	}
	return "✔︎ Todo initialized."
}

// Show renders the numbered list and the totals.
func (l List) Show() string {
	tasks := l.Load()
	if len(tasks) == 0 {
		return "Nessun task."
	}
	var b strings.Builder
	done := 0
	for i, t := range tasks {
		mark := "[ ]"
		if t.Done {
			mark = "[x]"
			done++
		}
		fmt.Fprintf(&b, "%d. %s %s\n", i+1, mark, t.Text)
	}
	fmt.Fprintf(&b, "\nTotali: %d, Da completare: %d", len(tasks), len(tasks)-done)
	return b.String()
}

// Add appends a task.
func (l List) Add(text string) (string, error) {
	if err := l.save(append(l.Load(), Task{Text: text})); err != nil {
		return "", err
	}
	return "Aggiunto: " + text, nil
}

// Remove deletes the task at the 1-based index.
func (l List) Remove(index int) (string, error) {
	tasks := l.Load()
	if index < 1 || index > len(tasks) {
		return "Indice non valido.", nil
	}
	removed := tasks[index-1]
	if err := l.save(append(tasks[:index-1], tasks[index:]...)); err != nil {
		return "", err
	}
	return "Rimosso: " + removed.Text, nil
}

// Done marks the task at the 1-based index as completed.
func (l List) Done(index int) (string, error) {
	tasks := l.Load()
	if index < 1 || index > len(tasks) {
		return "Indice non valido.", nil
	}
	tasks[index-1].Done = true
	if err := l.save(tasks); err != nil {
		return "", err
	}
	return "Completato: " + tasks[index-1].Text, nil
}
